import { Add, Remove } from "../engine/frame.js";
import { ClampAngle, v2, ExplosionProjectile, dustParticleEmitter, entity, fireParticleEmitter } from "../lib/classes.js";
import { SetSaveKey } from "../lib/data.js";
import { table } from "../lib/table.js";
import { LoadTextures, TextureBuffers } from "../lib/texture.js";
import { Layers, Shake, height, width } from "../renderer/render.js";
import { boss1 } from "./enemies/boss1.js";
import { lasership } from "./enemies/lasership.js";
import { SaveScore, SetScore } from "./score.js";

let waveIndex = 0;

let waves = [
    {pattern: [
        //{id: "wait",time: 5},
        {id: "enemy",enemy: "smallmeteor",count: 4,time: 5},
    ]},
    {pattern: [
        {id: "enemy",enemy: "smallmeteor",count: 15,time: 3}
    ]},
    {pattern: [
        {id: "enemy",enemy: "tinymeteor",count: 10,time: 1, parallel: true},
        {id: "enemy",enemy: "smallmeteor",count: 20,time: 1},
    ]},
    {pattern: [
        {id: "enemy",enemy: "tinymeteor",count: 100,time: 0.1},
        {id: "waitAll"},
        {id: "enemy",enemy: "tinymeteor",count: 100,time: 0},
    ]},
    {pattern: [
        {id: "enemy",enemy: "smallmeteor",count: 100,time: 0}
    ]},
    {pattern: [
        {id: "enemy",enemy: "mine",count: 5,time: 3},
        {id: "waitAll"},
        {id: "enemy",enemy: "smallmeteor",count: 25,time: 0.5, parallel: true},
        {id: "enemy",enemy: "mine",count: 6,time: 5},
    ]},
    {pattern: [
        {id: "enemy",enemy: "missile",count: 5,time: 3},
    ]},
    {pattern: [
        {id: "enemy",enemy: "smallmeteor",count: 100,time: 0.5, parallel: true},
        {id: "enemy",enemy: "missile",count: 9,time: 5}
    ]},
    {pattern: [
        {id: "enemy",enemy: "mine",count: 5,time: 3,parallel: true},
        {id: "enemy",enemy: "missile",count: 5,time: 3},
    ]},
    {pattern: [
        {id: "enemy",enemy: "boss1",count: 1,time: 0}
    ]},
    {pattern: [
        {id: "enemy",enemy: "lasership",count: 2,time: 20},
    ]},
    {pattern: [
        {id: "enemy",enemy: "lasership",count: 3,time: 10,parallel: true},
        {id: "enemy",enemy: "missile",count: 15,time: 2}
    ]},
    {pattern:[
        {id: "enemy",enemy: "lasership",count: 20,time: 1}
    ]}
]
waves.map(wave => {wave.pattern.push({id: "waitAll"})});

let attemptId = 0;
const parts = {
    wait: async obj => {
        let a = attemptId;
        await new Promise((complete, fail) => {
            let t = obj.time;
            const e = Add(dt => {t -= dt; if (t > 0) { return; } Remove(e); if (a != attemptId) { fail(); return; } complete(); });
        });
    },
    enemy: async obj => {
        for (let i=0; i < obj.count; i ++) {
            spawnEnemy(obj.enemy);
            await parts.wait(obj);
        }
    },
    waitAll: async obj => {
        let a = attemptId;
        await new Promise((complete, fail) => {
            const e = Add(dt => {if (enemyCount > 0) { return; } Remove(e); if (a != attemptId) { fail(); return; } complete(); });
        });
    }
};

let enemyCount = 0;
let enemies;
let hardattacks;
let impossibleattacks;

const LoadEnemies = () => {
    enemies = {
        laserprojectile: {
            textures: {
                default: "assets/enemylaser1.png"
            },
            width: 16,
            height: 16
        },
        laser: {
            textures: {
                frame0: "assets/enemyshootlaser0.png",
                frame1: "assets/enemyshootlaser1.png",
                frame2: "assets/enemyshootlaser2.png",
                frame3: "assets/enemyshootlaser3.png",
                frame4: "assets/enemyshootlaser4.png",
            },
            width: 9,
            height: 9
        },
        fire: {
            textures: {
                full0: "assets/trail-full0.png",
                full1: "assets/trail-full1.png",
                full2: "assets/trail-full2.png",
                full3: "assets/trail-full3.png",
                smoke0: "assets/trail-smoke0.png",
                smoke1: "assets/trail-smoke1.png",
            },
            width: 5,
            height: 5
        },
        dust: {
            textures: {dust0: "assets/trail-smoke0.png", dust1: "assets/trail-smoke1.png"},
            width: 5,
            height: 5,
        },
        lasership: {
            textures: {
                default: "assets/ship-forward.png",
            },
            width: 16,
            height: 16,
            size: new v2(16,16),
            hitbox: new v2(8,8),
            score: 35,
            health: 150,
            oob: true,
            load: e => {
                e.fire = new fireParticleEmitter("Fire",0,e,new v2(0,0),enemies.fire.textures,new v2(5,5));
                e.dust = new dustParticleEmitter("Destroy",0,e,new v2(0,0),enemies.dust.textures,new v2(5,5));
                lasership.load(e,player,enemies.laser.textures,enemies.laserprojectile.textures,hardattacks,impossibleattacks);
            },
            ai: (e, dt) => {
                if (e.removetimer) {
                    e.removetimer -= dt;
                    if (e.removetimer > 0) { return; }
    
                    e.destroy();
                    return;
                }
                lasership.ai(e,dt);
            },
            died: e => {
                e.inactive = true;
                e.invisible = true;
                e.removetimer = 5;

                for (let i=0;i<8;i++) { e.fire.emit(); }
                for (let i=0;i<32;i++) { e.dust.emit(); }
                
                Shake(2,0.5);
            }
        },
        boss1: {
            textures: {
                default: "assets/bigship.png",
            },
            width: 64,
            height: 64,
            size: new v2(64,64),
            hitbox: 30,
            score: 500,
            health: 4600,
            oob: true,
            load: e => {
                e.fire = new fireParticleEmitter("Fire",0,e,new v2(0,0),enemies.fire.textures,new v2(5,5));
                e.dust = new dustParticleEmitter("Destroy",0,e,new v2(0,0),enemies.dust.textures,new v2(5,5));
                boss1.load(e,player,enemies.laser.textures,enemies.laserprojectile.textures,hardattacks,impossibleattacks);
            },
            ai: (e, dt) => {
                if (e.removetimer) {
                    e.removetimer -= dt;
                    if (e.removetimer > 0) { return; }
    
                    e.destroy();
                    return;
                }
                boss1.ai(e,dt);
            },
            died: e => {
                e.inactive = true;
                e.invisible = true;
                e.removetimer = 5;

                for (let i=0;i<64;i++) { e.fire.emit(); }
                for (let i=0;i<64;i++) { e.dust.emit(); }
                player.inactive = false;
            }
        },
        missile: {
            textures: {default: "assets/mine-small1.png"},
            width: 8,
            height: 8,
            size: new v2(8,8),
            hitbox: 2,
            score: 12,
            health: 75,
            oob: true,
            load: e => {
                e.lock = 7;
                e.weight = 25;
                e.velocity = player.pos.sub(e.pos).unit().multiply(40);
                e.explosion = new fireParticleEmitter("Explode",0,e,new v2(0,0),enemies.fire.textures,new v2(5,5));
                e.hit = e1 => {
                    if (impossibleattacks && !e1.isPlayer) { return; }
                    if (e1.isProjectile) { return; }
                    e.damage(999,e1);
                }
            },
            ai: (e, dt) => {
                if (e.removetimer) {
                    e.removetimer -= dt;
                    if (e.removetimer > 0) { return; }
    
                    e.destroy();
                    return;
                }
                if (e.detonate) { e.detonate -= dt; if (e.detonate <= 0) { e.damage(999,e); return; } }
                e.lock -= dt;
                if (e.lock > 0) { return; }
                
                e.detonate = 3;
                e.hitbox = 24;
    
                e.velocity = e.velocity.add(player.pos.sub(e.pos).unit().multiply(dt * 800)).add(player.velocity.multiply(dt / Math.sqrt(player.pos.sub(e.pos).magnitude()) * 25));
    
                //let d = player.pos.sub(e.pos).abs();
                //d = player.pos.add(player.velocity.multiplyv2(t)).sub(e.pos);
                //if (t.x == 0 || t.y == 0) { return; }
    
    
                //e.velocity = e.velocity.add(new v2((d.x * 2) / (t.x * t.x),(d.y * 2) / (t.y * t.y)).multiply(dt));
                //e.velocity = e.velocity.add(new v2((d.x - e.velocity.x * t.x * 2) / (t.x * t.x),(d.y - e.velocity.y * t.y * 2) / (t.y * t.y)).multiply(dt));
                //e.velocity = e.velocity.add(player.pos.sub(e.pos).unit().multiply(dt * a));
            },
            died: e => {
                e.inactive = true;
                e.invisible = true;
                e.removetimer = 5;
                
                for (let i=0;i < 128; i ++) { e.explosion.emit(); }
                new ExplosionProjectile("Explosion","Explosion",e.pos,new v2(0,0),new v2(64,64),64,e.layer);
                e.velocity = new v2(0,0);
            }
        },
        mine: {
            textures: {default: "assets/mine-small1.png"},
            width: 8,
            height: 8,
            size: new v2(8,8),
            hitbox: 6,
            score: 8,
            health: 25,
            oob: true,
            ai: (e, dt) => {
                if (e.removetimer) {
                    e.removetimer -= dt;
                    if (e.removetimer > 0) { return; }
    
                    e.destroy();
                    return;
                }
    
                e.trot = ClampAngle(e.trot + dt * 1);
    
                e.velocity = e.velocity.add(player.pos.sub(e.pos).unit().multiply(dt * 300));
                e.velocity = e.velocity.sub(e.velocity.multiply(dt * 1));
            },
            load: e => {
                e.explosion = new fireParticleEmitter("Explode",0,e,new v2(0,0),enemies.fire.textures,new v2(5,5));
                e.hit = e1 => {
                    if (impossibleattacks && !e1.isPlayer) { return; }
                    if (e1.isProjectile) { return; }
                    e.damage(999,e1);
                }
            },
            died: e => {
                e.inactive = true;
                e.invisible = true;
                e.removetimer = 5;
                
                for (let i=0;i < 128; i ++) { e.explosion.emit(); }
                e.velocity = new v2(0,0);
                new ExplosionProjectile("Explosion","Explosion",e.pos,new v2(0,0),new v2(64,64),48,e.layer);
            }
        },
        tinymeteor: {
            textures: {default: "assets/meteor-tiny1.png"},
            width: 6,
            height: 6,
            size: new v2(6,6),
            hitbox: new v2(5,5),
            health: 5,
            dmg: 2,
            score: 1,
            oob: true,
            ai: (e, dt) => {
                if (e.removetimer) {
                    e.removetimer -= dt;
                    if (e.removetimer > 0) { return; }
    
                    e.destroy();
                    return;
                }
                e.trot = ClampAngle(e.trot + dt * 3);
                if (hardattacks) {
                    if (impossibleattacks) {
                        let d = player.pos.sub(e.pos);
                        let m = e.velocity.magnitude();
                        let t = Math.min(1,d.magnitude() / m);
                        if (m == 0) { t = 0; }
                        e.velocity = e.velocity.add(player.pos.add(player.velocity.multiply(t)).sub(e.pos).unit().multiply(dt * 40));
                        e.velocity = e.velocity.sub(e.velocity.multiply(dt / 4));
                    }
                    let s = 40;
                    e.velocity = e.velocity.add(player.pos.sub(e.pos).unit().multiply(dt * s));
                    e.velocity = e.velocity.sub(e.velocity.multiply(dt / 4));

                    return;
                }
                
                if (e.outside) { e.destroy(); }
            },
            load: e => {
                e.velocity = player.pos.sub(e.pos).unit().multiply(120);
                e.dust = new dustParticleEmitter("Destroy",0,e,new v2(0,0),enemies.dust.textures,new v2(5,5));
            },
            ondamage: e => {
                e.dust.emit();
                Shake(0.1,0.5);
            },
            died: e => {
                e.inactive = true;
                e.invisible = true;
                e.removetimer = 4;
                Shake(0.5,0.5);
                
                
                for (let i=0;i < 4; i ++) { e.dust.emit(); }
                e.velocity = new v2(0,0);
            }
        },
        smallmeteor: {
            textures: {default: "assets/meteor-small1.png", default1: "assets/meteor-small2.png"},
            width: 16,
            height: 16,
            size: new v2(16,16),
            hitbox: new v2(11,11),
            health: 40,
            dmg: 8,
            score: 3,
            oob: true,
            spawns: {count: 3, id: "tinymeteor"},
            ai: (e,dt) => {
                if (e.removetimer) {
                    e.removetimer -= dt;
                    if (e.removetimer > 0) { return; }
    
                    e.destroy();
                    return;
                }
                e.trot = ClampAngle(e.trot + dt);
                if (hardattacks) {
                    let d = player.pos.sub(e.pos);
                    let m = e.velocity.magnitude();
                    let t = Math.min(1,d.magnitude() / m);
                    if (m == 0) { t = 0; }
                    e.velocity = e.velocity.add(player.pos.add(player.velocity.multiply(t)).sub(e.pos).unit().multiply(dt * 65));
                    e.velocity = e.velocity.sub(e.velocity.multiply(dt));
                    return;
                }
                const u = player.pos.sub(e.pos).unit();
                e.velocity = e.velocity.add(new v2(u.x,u.y).multiply(dt * 50));
                e.velocity = e.velocity.sub(e.velocity.multiply(dt));
    
            },
            load: e => {
                //e.texture = e.textures["default"+(Math.floor(Math.random() * 2)).toString()];
                e.dust = new dustParticleEmitter("Destroy",0,e,new v2(0,0),enemies.dust.textures,new v2(5,5));
            },
            ondamage: e => {
                e.dust.emit();
                Shake(0.4,0.5);
            },
            died: e => {
                e.inactive = true;
                Shake(1,0.5);
    
                const s = 3;
                const b = Math.random();
                for (let i=0; i < s; i ++) {
                    const a = i / s + b;
                    const spawn = spawnEnemy("tinymeteor");
                    
                    const rot = a * Math.PI * 2;
                    spawn.pos = e.pos.add(new v2(Math.sin(rot),-Math.cos(rot)).multiply(5));
                    spawn.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(60).add(e.velocity);
                    spawn.iframes = 0.25;
                }
                e.invisible = true;
                e.removetimer = 4;
                
                for (let i=0;i < 15; i ++) { e.dust.emit(); }
                e.velocity = new v2(0,0);
            }
        }
    }
}

let enemylist = [];

let hpmultiplier;
export const SetEnemyDifficulty = diff => {
    hpmultiplier = diff.healthmultiplier;
    hardattacks = diff.hardattacks;
    impossibleattacks = diff.impossibleattacks;
}
const spawnEnemy = id => {
    enemyCount += 1;
    const enemy = enemies[id];
    if (!enemy) { return; }

    let e = new entity("Enemy",enemy.size,enemy.hitbox,Layers.Enemies,enemy.textures);
    e.group = "Enemy";
    e.health = enemy.health;
    if (hpmultiplier) { e.health *= hpmultiplier; }
    e.texture = enemy.textures.default;
    e.dmg = enemy.dmg;
    e.score = enemy.score;
    e.oob = enemy.oob;
    e.pos = new v2(Math.random() * width, -20);

    if (enemy.load) { try { enemy.load(e); } catch (err) { console.error(err); return; }}
    e.died = () => { enemy.died(e); }
    e.ondamage = enemy.ondamage;
    e.event = Add(dt => {
        enemy.ai(e,dt);
        e.frame(dt);
        e.render();
    });
    e.removing = () => {
        table.remove(enemylist,e);
        enemyCount -= 1;
    }
    table.insert(enemylist,e);

    return e;
}

const wavePart = async (pattern,index) => {
    const part = pattern[index];

    if (!part) { return; }

    if (part.parallel) {
        try { parts[part.id](part) } catch {};
    } else { await parts[part.id](part); }
    
    await wavePart(pattern,index + 1);
}
const spawnWave = async index => {
    const wave = waves[index];

    waveIndex = index;
    SetSaveKey("wave",waveIndex);
    await SaveScore();

    try {
        await wavePart(wave.pattern,0);
        spawnWave(index + 1);
    } catch (err) {
        console.log("No more waves :(");
    }
}

let player;
export const SetPlayer = plr => {
    player = plr;
}

export const LoadWave = () => {
    attemptId ++;
    enemylist.map(enemy => {
        if (!enemy) { return; }
        enemy.destroy();
    });
    enemylist = [];
    spawnWave(waveIndex);
}

const startFromWave = wave => {
    waveIndex = wave;
    let s = 0;
    for (let i=0;i<wave;i++) {
        const w = waves[i];
        w.pattern.map(p => {
            if (p.id != "enemy") { return; }
            let enemy = enemies[p.enemy];
            if (!enemy) { return; }

            s += enemy.score * p.count;
            if (enemy.spawns) {
                let e = enemies[enemy.spawns.id];
                if (!e) { return; }
                s += e.score * enemy.spawns.count * p.count;
            }
        });
    }

    SetScore(s);
}
export const Load = async (savedata) => {
    LoadEnemies();
    //startFromWave(12);
    waveIndex = savedata.wave || 0;
    let promise = new Promise(completed => {
        let textures = 0;
        Object.entries(enemies).map(async i => {
            const enemy = i[1];
            if (!enemy) { return; }
            textures += 1;
            enemy.textures = await TextureBuffers(await LoadTextures(enemy.textures),enemy.width,enemy.height);
            textures -= 1;
            if (textures > 0) { return; }
            completed();
        });
    });

    await promise;
}