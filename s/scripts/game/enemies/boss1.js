import { LaserProjectile, laserParticleEmitter, transform, v2 } from "../../lib/classes.js";
import { weightCheck } from "../../lib/random.js";
import { Layers, Shake, height, width } from "../../renderer/render.js";

let hardattacks;
let impossibleattacks;

let player;
let attacks = {
    ram: {weight: 1, ai: (e) => {
        e.timer = 1;
        if (hardattacks) { e.timer -= 0.2; }
        if (impossibleattacks) { e.timer -= 0.2; }
        e.chargespeed = 450 + Math.random() * 85;
        if (hardattacks) { e.chargespeed -= 40 + Math.random() * 54; }
        
        let t = player.pos.sub(e.pos).magnitude() / e.chargespeed;
        t += Math.sqrt(t) / 3;
        turnTo(e,player.pos.add(player.velocity.multiply(t)));
        e.phase = chargeback;
        e.turnspeed = 10;
        e.velocity = new v2(0,0);
    }}, chase: {weight: 100, ai: e => {
        e.turnspeed = 2;
        e.timer = 10 + Math.random() * 10;
        e.phase = chase;
    }}, center: {weight: 1, ai: e => {
        e.timer = 1;
        e.rotspeed = 1;
        if (hardattacks) {
            e.rotspeed = 3;
        }
        if (impossibleattacks) {
            e.rotspeed += 2;
        }

        e.spos = e.pos;
        e.phase = gotocenter;
    }},
};

export const boss1 = {
    load: (e,plr,laserTextures,lasertextures,hardmode,impossiblemode) => {
        hardattacks = hardmode;
        impossibleattacks = impossiblemode;
        e.timer = 1;
        e.weight = 14;
        e.charges = 5;
        e.phase = start;
        e.turnspeed = 3;
        e.laserTextures = laserTextures;
        e.lasertextures = lasertextures;
        e.shootspeed = 0;
        player = plr;
        
        e.leftLaserLeft = new laserParticleEmitter("LeftLaser",0,e,new v2(-30,-21),laserTextures,new v2(9,9));
        e.leftLaserRight = new laserParticleEmitter("RightLaser",0,e,new v2(-18,-21),laserTextures,new v2(9,9));
        e.rightLaserLeft = new laserParticleEmitter("LeftLaser",0,e,new v2(18,-21),laserTextures,new v2(9,9));
        e.rightLaserRight = new laserParticleEmitter("RightLaser",0,e,new v2(30,-21),laserTextures,new v2(9,9));

        e.deathEffect = boss1.died;
    },
    ai: (e, dt) => {
        e.phase(e,dt);
    },
    died: async e => {
        player.inactive = true;
        e.inactive = true;
        e.timer = 1;
        e.ovel = e.velocity;
        e.cycle = 1;
        e.cycletimer = 0;
        e.phase = slow;
        await new Promise(completed => {e.death = completed});
    }
}

const slow = (e,dt) => {
    e.velocity = e.velocity.sub(e.ovel.multiply(dt));

    e.timer -= dt;
    if (e.timer > 0) { return; }
    e.velocity = new v2(0,0);

    e.timer = 3;
    e.opos = e.pos;
    e.phase = dying;
}
const dying = (e,dt) => {
    e.cycletimer += dt * 20;
    e.dust.emit();
    if (e.cycletimer >= 1) {
        e.cycletimer -= 1;
        e.cycle = -e.cycle;
        Shake(2,0.5);
        
        
        e.pos = e.opos.add(new v2(e.cycle * 3,0));
    }

    e.timer -= dt;
    if (e.timer > 0) { return; }
    Shake(200,3);
    e.death();
}

const shoot = e => {
    e.leftLaserLeft.emit();
    e.leftLaserRight.emit();
    e.rightLaserLeft.emit();
    e.rightLaserRight.emit();
    
    let rot = e.rot;
    let dir = rot;
    let speed = 180;
    let p = 5;
    let d = 15;
    let w = 0.2;
    
    const t1 = new LaserProjectile("Bosslaser","Enemy",e.pos.add(transform(rot,new v2(-24,-18))),new v2(Math.sin(dir),-Math.cos(dir)).multiply(speed),new v2(16,16),new v2(14,14),Layers.Projectiles,e.lasertextures);
    t1.texture = t1.textures.default;
    t1.textures2 = e.laserTextures;
    t1.pierce = p;
    t1.dmg = d;
    t1.weight = w;
    
    const t2 = new LaserProjectile("Bosslaser","Enemy",e.pos.add(transform(rot,new v2(24,-18))),new v2(Math.sin(dir),-Math.cos(dir)).multiply(speed),new v2(16,16),new v2(14,14),Layers.Projectiles,e.lasertextures);
    t2.texture = t2.textures.default;
    t2.textures2 = e.laserTextures;
    t2.pierce = p;
    t2.dmg = d;
    t2.weight = w;
}
const start = (e,dt) => {
    e.timer -= dt;
    if (e.timer > 0) { return; }

    gotorandom(e);
}

const gotorandom = e => {
    e.speed = 115 + Math.random() * 35;
    e.phase = going; 
}
const going = (e,dt) => {
    let tpos = player.pos;
    turnTo(e,tpos);
    let d = tpos.sub(e.pos).magnitude();
    let s = e.speed * dt;
    if (s >= d - 92) {
        e.phase = think;
        return;
    }

    let rot = e.rot;
    e.velocity = e.velocity.lerp(new v2(Math.sin(rot),-Math.cos(rot)).multiply(e.speed),dt * 10);
}

const think = (e,dt) => {
    if (!e.thinking) { e.thinking = 1; gotorandom(e); return; }
    e.thinking -= dt;
    e.velocity = e.velocity.sub(e.velocity.multiply(dt * 1.1));
    if (e.thinking > 0) { return; }
    e.thinking = undefined;

    weightCheck(attacks).ai(e);
}

const turnTo = (e,p) => {
    let d = p.sub(e.pos);
    e.trot = Math.atan2(d.x,-d.y);
}

const chase = (e,dt) => {
    let t;
    let s = 350;
    let d = 0.5;

    e.dmg = 15;
    let epos = e.pos;
    if (hardattacks) {
        s += 70; d += 0.3;
        e.dmg += 3;
        
        t = player.pos.sub(e.pos).magnitude() / (e.velocity.magnitude() + s);
    } else {
        t = player.pos.sub(e.pos).magnitude() / e.velocity.magnitude();
    }
    if (hardattacks) {
        epos = epos.sub(e.velocity.unit().multiply(t));
    }

    let tpos = player.pos.add(player.velocity.multiply(t));
    turnTo(e,player.pos);

    //e.shootspeed += dt;
    //if (e.shootspeed > 0) { e.shootspeed -= 1; shoot(e); }
    e.timer -= dt;

    
    e.velocity = e.velocity.add(tpos.sub(epos).unit().multiply(dt * s));
    e.velocity = e.velocity.sub(e.velocity.multiply(dt * d));
    if (e.timer > 0) { return; }
    e.dmg = 1;
    e.phase = think;
}
const chargeback = (e,dt) => {
    let rot = e.rot;
    e.timer -= dt;
    e.velocity = e.velocity.sub(e.velocity.multiply(dt * 1.5));
    if (e.timer > 0) {
        e.velocity = e.velocity.add(new v2(-Math.sin(rot),Math.cos(rot)).multiply((1 - e.timer) * dt * 450));
        return;
    }
    e.dmg = 40;
    e.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(e.chargespeed);
    e.phase = charging;
    e.timer = 0.5;
    if (hardattacks) { e.timer += 0.2; }
    if (impossibleattacks) { e.timer += 0.1;}
}
const charging = (e,dt) => {
    e.timer -= dt;
    if (e.timer > 0) { return; }

    e.dmg = 1;
    
    if (Math.random() >= 0.1 && e.charges > 0) { e.charges -= 1; attacks.ram.ai(e); } else { e.phase = think; e.charges = 5; }
}

const gotocenter = (e,dt) => {
    e.timer -= dt;
    e.pos = e.spos.lerp(new v2(width/2,height/2),Math.min(1,1 - e.timer) ** 2);
    if (e.timer > 0) { return; }
    e.timer = 8 + Math.random() * 8;
    if (impossibleattacks) { e.timer += 4 + Math.random() * 9; }
    e.phase = center;
}
const center = (e,dt) => {
    e.trot += e.rotspeed * dt;
    e.rotspeed += dt / 10;
    e.rot = e.trot;
    e.pos = new v2(width/2,height/2);
    e.velocity = new v2(0,0);

    let s = 10;
    if (hardattacks) { s -= 3; }
    if (impossibleattacks) { s += 2;}
    e.shootspeed += dt * s;
    if (e.shootspeed > 0) { e.shootspeed -= 1; shoot(e); }

    e.timer -= dt;
    if (e.timer > 0) { return; }

    e.phase = think;
}