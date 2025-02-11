import { laserParticleEmitter, LaserProjectile, transform, v2 } from "../../lib/classes.js";
import { height, Layers, width } from "../../renderer/render.js";

let player;
let hardattacks;
let impossibleattacks;
export const lasership = {
    load: (e,plr,laserTextures,lasertextures,hardmode,impossiblemode) => {
        hardattacks = hardmode;
        impossibleattacks = impossiblemode;
        e.timer = -2;
        e.laserTextures = laserTextures;
        e.lasertextures = lasertextures;
        e.shootspeed = 1;
        e.speed = 64;
        e.acceleration = 3;
        if (hardattacks) { e.speed += 32; e.shootspeed += 0.2; }
        if (impossibleattacks) { e.shootspeed += 0.5; e.acceleration += 1.5; }
        player = plr;
        
        e.leftLaser = new laserParticleEmitter("LeftLaser",0,e,new v2(-6,-8),laserTextures,new v2(9,9));
        e.rightLaser = new laserParticleEmitter("RightLaser",0,e,new v2(6,-8),laserTextures,new v2(9,9));
    },
    ai: (e,dt) => {
        if (!e.targetpos) { e.targetpos = getTargetPos(e); }

        let d = player.pos.sub(e.pos);
        e.trot = Math.atan2(d.x,-d.y);

        e.timer += e.shootspeed * dt;
        if (e.timer >= 1) {
            e.timer -= 1;
            shoot(e);
            if (Math.random() >= 0.1) { e.targetpos = getTargetPos(e) };
        }
        d = e.targetpos.sub(e.pos);

        let s = e.speed * dt;
        if (s >= d.magnitude()) {
            e.targetpos = getTargetPos(e);
            return;
        }
        
        let dir = d.unit();
        e.velocity = e.velocity.add((new v2(e.speed * dir.x,e.speed * dir.y).sub(new v2(e.velocity.x,e.velocity.y))).multiply(dt * e.acceleration));      
    }
}

const getTargetPos = e => {
    let x = 64 + (width - 128) * Math.random();
    if (player.pos.y > height / 2) {
        return new v2(x,16 + Math.random() * 32);
    }

    return new v2(x,height - 16 - Math.random() * 24);
}

const shoot = e => {
    e.leftLaser.emit();
    e.rightLaser.emit();
    
    let rot = e.rot;
    let dir = rot;
    let speed = 315;
    let p = 5;
    let d = 21;
    let w = 0.2;
    
    const t1 = new LaserProjectile("Enemylaser","Enemy",e.pos.add(transform(rot,new v2(0,8))),new v2(Math.sin(dir),-Math.cos(dir)).multiply(speed),new v2(16,16),new v2(14,14),Layers.Projectiles,e.lasertextures);
    t1.texture = t1.textures.default;
    t1.textures2 = e.laserTextures;
    t1.pierce = p;
    t1.dmg = d;
    t1.weight = w;
}