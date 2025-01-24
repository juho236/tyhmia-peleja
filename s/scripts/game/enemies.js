import { Add, Remove } from "../engine/frame.js";
import { ClampAngle, ExplosionProjectile, dustParticleEmitter, entity, fireParticleEmitter, v2 } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { LoadTextures, TextureBuffers } from "../lib/texture.js";
import { Layers, height, width } from "../renderer/render.js";

let waveIndex = 5;

let waves = [
    {pattern: [
        //{id: "wait",time: 5},
        {id: "enemy",enemy: "smallmeteor",count: 4,time: 5},
    ]},
    {pattern: [
        {id: "enemy",enemy: "smallmeteor",count: 15,time: 3}
    ]},
    {checkpoint: true, pattern: [
        {id: "enemy",enemy: "tinymeteor",count: 10,time: 1},
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
        //{id: "enemy",enemy: "mine",count: 5,time: 3},
        {id: "enemy",enemy: "smallmeteor",count: 25,time: 0},
        {id: "enemy",enemy: "mine",count: 5,time: 1},
    ]},
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
        let a = attemptId;
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
let enemies = {
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
    mine: {
        textures: {default: "assets/mine-small1.png"},
        width: 8,
        height: 8,
        size: new v2(8,8),
        hitbox: new v2(12,12),
        health: 1,
        ai: (e, dt) => {
            if (e.removetimer) {
                e.removetimer -= dt;
                if (e.removetimer > 0) { return; }

                e.destroy();
                return;
            }

            e.trot = ClampAngle(e.trot + dt * 1);

            e.velocity = e.velocity.add(player.pos.sub(e.pos).unit().multiply(dt * 200));
            e.velocity = e.velocity.sub(e.velocity.multiply(dt * 2));
        },
        load: e => {
            e.explosion = new fireParticleEmitter("Explode",0,e,new v2(0,0),enemies.fire.textures,new v2(5,5));
        },
        died: e => {
            e.inactive = true;
            e.invisible = true;
            e.removetimer = 5;
            
            for (let i=0;i < 64; i ++) { e.explosion.emit(); }
            e.velocity = new v2(0,0);
            new ExplosionProjectile("Explosion","Explosion",e.pos,new v2(0,0),new v2(64,64),new v2(64,64),e.layer);
        }
    },
    tinymeteor: {
        textures: {default: "assets/meteor-tiny1.png"},
        width: 6,
        height: 6,
        size: new v2(6,6),
        hitbox: new v2(5,5),
        health: 2,
        oob: true,
        ai: (e, dt) => {
            if (e.removetimer) {
                e.removetimer -= dt;
                if (e.removetimer > 0) { return; }

                e.destroy();
                return;
            }
            e.trot = ClampAngle(e.trot + dt * 3);
            
            if (e.outside) { e.destroy(); }
        },
        load: e => {
            e.velocity = player.pos.sub(e.pos).unit().multiply(120);
            e.dust = new dustParticleEmitter("Destroy",0,e,new v2(0,0),enemies.dust.textures,new v2(5,5));
        },
        ondamage: e => {
            e.dust.emit();
        },
        died: e => {
            e.inactive = true;
            e.invisible = true;
            e.removetimer = 4;
            
            
            for (let i=0;i < 4; i ++) { e.dust.emit(); }
            e.velocity = new v2(0,0);
        }
    },
    smallmeteor: {
        textures: {default: "assets/meteor-small1.png"},
        width: 16,
        height: 16,
        size: new v2(16,16),
        hitbox: new v2(11,11),
        health: 8,
        oob: true,
        ai: (e,dt) => {
            if (e.removetimer) {
                e.removetimer -= dt;
                if (e.removetimer > 0) { return; }

                e.destroy();
                return;
            }
            e.trot = ClampAngle(e.trot + dt);
            const u = player.pos.sub(e.pos).unit();
            e.velocity = e.velocity.add(new v2(u.x,u.y).multiply(dt * 50));
            e.velocity = e.velocity.sub(e.velocity.multiply(dt));

        },
        load: e => {
            e.dust = new dustParticleEmitter("Destroy",0,e,new v2(0,0),enemies.dust.textures,new v2(5,5));
        },
        ondamage: e => {
            e.dust.emit();
        },
        died: e => {
            e.inactive = true;

            const s = 3;
            const b = Math.random();
            for (let i=0; i < s; i ++) {
                const a = i / s + b;
                const spawn = spawnEnemy("tinymeteor");
                
                const rot = a * Math.PI * 2;
                spawn.pos = e.pos.add(new v2(Math.sin(rot),-Math.cos(rot)).multiply(5));
                spawn.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(60).add(e.velocity);
            }
            e.invisible = true;
            e.removetimer = 4;
            
            for (let i=0;i < 15; i ++) { e.dust.emit(); }
            e.velocity = new v2(0,0);
        }
    }
}

let enemylist = [];

const spawnEnemy = id => {
    enemyCount += 1;
    const enemy = enemies[id];
    if (!enemy) { return; }

    let e = new entity("Enemy",enemy.size,enemy.hitbox,Layers.Enemies,enemy.textures);
    e.group = "Enemy";
    e.health = enemy.health;
    e.texture = enemy.textures.default;
    e.oob = enemy.oob;
    e.pos = new v2(Math.random() * width, -20);

    if (enemy.load) { enemy.load(e); }
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

    await parts[part.id](part);
    await wavePart(pattern,index + 1);
}
const spawnWave = async index => {
    const wave = waves[index];

    if (wave.checkpoint) { waveIndex = index; }
    try {
        await wavePart(wave.pattern,0);
        spawnWave(index + 1);
    } catch (err) {

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

export const Load = async () => {
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