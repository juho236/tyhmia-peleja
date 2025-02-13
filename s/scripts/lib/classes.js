import { Add, Remove } from "../engine/frame.js";
import { AddScore } from "../game/score.js";
import { GetShake, height, Shake, width } from "../renderer/render.js";
import { table } from "./table.js";
import { BlankBuffer, ColorCopy } from "./texture.js";

export class v2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    lerp(v,dt) {
        return new v2(this.x + (v.x - this.x) * dt,this.y + (v.y - this.y) * dt);
    } 
    add(v) {
        return new v2(this.x + v.x,this.y + v.y);
    }
    sub(v) {
        return new v2(this.x - v.x,this.y - v.y);
    }
    multiply(n) {
        return new v2(this.x * n, this.y * n);
    }
    divide(n) {
        return new v2(this.x / n, this.y / n);
    }
    multiplyv2(v) {
        return new v2(this.x * v.x, this.y * v.y);
    }

    clamp(min, max) {
        return new v2(Math.min(Math.max(this.x,min.x),max.x),Math.min(Math.max(this.y,min.y),max.y));
    }
    unit() {
        if (this.x == 0 && this.y == 0) { return this; }

        const d = Math.sqrt(this.x * this.x + this.y * this.y);
        return new v2(this.x / d, this.y / d);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    abs() {
        return new v2(Math.abs(this.x),Math.abs(this.y));
    }
}

export const ClampAngle = angle => {
    let u = Math.sign(angle);
    return (angle + u * Math.PI) % (Math.PI * 2) - u * Math.PI;
}

export const AngleDir = (angle,targetAngle) => {
    const d = targetAngle - angle;
    let u = Math.sign(d);
    if (Math.abs(d) > Math.PI) { u = -u; }
    return u;
}
export const AngleDiff = (angle,targetAngle) => {
    let d = Math.abs(targetAngle - angle);
    if (d > Math.PI) { d -= Math.PI; }
    return d * AngleDir(angle,targetAngle);
}
export const TurnTowards = (angle,targetAngle,speed) => {
    const d = targetAngle - angle;
    if (Math.abs(d) <= speed) { return ClampAngle(targetAngle); }
    return ClampAngle(angle + AngleDir(angle,targetAngle) * speed);
}

let particlePriority = [];
let importantParticles = [];
const remove = async particle => {
    table.remove(particle.emitter.particles,particle);
    if (particle.important) {
        table.remove(importantParticles,particle);
    } else {
        table.remove(particlePriority,particle);
    }
    
}
const Destroy = obj => {
    table.pairs(obj,(key, value) => {
        obj[key] = undefined;
        //destroy(value);
    });
}

class ParticleEmitter {
    constructor(name,rate,entity,offset,textures,size) {
        if (!entity.emitters) { return; }
        this.name = name;
        
        this.size = size;
        this.rate = rate;
        this.offset = offset;
        this.target = entity;
        this.textures = textures;
        table.insert(entity.emitters,this);
    }
    particles = [];
    cooldown = 0;

    emit() {
        const p = this.new();
        p.emitter = this;
        if (p.velocity) { p.velocity = p.velocity.add(this.target.velocity); }
        table.insert(this.particles,p);

        if (p.important) {
            const e = table.add(importantParticles,p,0);
            if (e > 300) { table.iterate(importantParticles,remove,300); }
        } else {
            const e = table.add(particlePriority,p,0);
            if (e > 200) { table.iterate(particlePriority,remove,200); }
        }
    }

    frame(dt) {
        this.cooldown += dt * this.rate;
        while (this.cooldown >= 1) {
            this.cooldown -= 1;
            this.emit();
        }

        this.particles.map(particle => {
            if (!particle) { return; }

            particle.lifetime -= dt;
            if (particle.lifetime <= 0) {
                remove(particle);
                return;
            }

            this.pframe(particle,dt);
            if (this.oframe) { this.oframe(dt); }
        });
    }
    render() {
        this.particles.map(particle => {
            if (!particle) { return; }

            draw(particle,this.target.layer,particle.buffer);
        });
    }
}
class RandomEmit extends ParticleEmitter {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }

    pframe(particle,dt) {
        if (particle.lifetime < 0.75) {
            particle.options = 1;
            particle.path = "smoke";
        }

        particle.animation += dt * 5;
        particle.buffer.Draw.globalAlpha = particle.lifetime;
        if (particle.animation >= 1) {
            particle.animation -= 1;

            changeTexture(particle,particle.options);
        }
        particle.rot += Math.sign(particle.rot) * dt * 4;
        particle.pos = particle.pos.add(particle.velocity.multiply(dt));
    } 
}
class OrderEmit extends ParticleEmitter {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }

    pframe(particle,dt) {
        particle.animation += dt * 24;
        if (particle.animation >= 1) {
            particle.animation -= 1;

            let str = `${particle.path}${particle.animationindex}`;
            particle.texture = particle.textures[str];
            particle.animationindex += 1;
        }

        particle.pos = this.target.pos.add(transform(this.target.rot,particle.offset))
    } 
}
class BurstEmit extends ParticleEmitter {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }

    pframe(particle,dt) {
        particle.buffer.Draw.globalAlpha = particle.lifetime / 2;
        particle.rot += Math.sign(particle.rot) * dt * 4;
        particle.pos = particle.pos.add(particle.velocity.multiply(dt));
    } 
}

export class dustParticleEmitter extends BurstEmit {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }

    new() {
        const rot = Math.random() * Math.PI * 2;
        const obj = {
            pos: this.target.pos,
            rot: Math.random() * 2 * Math.PI,
            size: this.size,
            velocity: new v2(-Math.sin(rot),Math.cos(rot)).multiply(60 + Math.random() * 40),
            lifetime: 1,
            textures: this.textures,
            buffer: BlankBuffer(this.size.x,this.size.y),
            path: "dust",
            options: 1
        };

        changeTexture(obj,obj.options);
        return obj;
    }
}
export class fireParticleEmitter extends RandomEmit {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }

    new() {
        const rot = Math.random() * Math.PI * 2;
        const obj = {
            pos: this.target.pos,
            rot: Math.random() * 2 * Math.PI,
            size: this.size,
            velocity: new v2(-Math.sin(rot),Math.cos(rot)).multiply(120 + Math.random() * 90),
            lifetime: 1,
            textures: this.textures,
            buffer: BlankBuffer(this.size.x,this.size.y),
            animation: 0,
            path: "full",
            options: 3,
            important: true,
        };

        changeTexture(obj,obj.options);
        return obj;
    }
}
export class laserParticleEmitter extends OrderEmit {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }
    new() {
        const rot = this.target.rot;
        const obj = {
            pos: this.target.pos.add(transform(rot,this.offset)),
            rot: 0,
            size: this.size,
            lifetime: 0.2,
            textures: this.textures,
            buffer: BlankBuffer(this.size.x,this.size.y),
            animation: 1,
            animationindex: 0,
            path: "frame",
        };

        obj.offset = this.offset;
        obj.texture = obj.textures.frame0;
        return obj;
    }
    oframe(dt) {
        
    }
}
class LaserHitParticleEmitter extends OrderEmit {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }
    new() {
        const offset = new v2(Math.random() * this.target.size.x - this.target.size.x / 2,Math.random() * this.target.size.y - this.target.size.y / 2);
        const rot = this.target.rot;
        const obj = {
            pos: this.target.pos.add(transform(rot,offset)),
            rot: 0,
            size: this.size,
            lifetime: 0.2,
            textures: this.textures,
            buffer: BlankBuffer(this.size.x,this.size.y),
            animation: 1,
            animationindex: 0,
            path: "frame",
        };

        obj.offset = offset;
        obj.texture = obj.textures.frame0;
        return obj;
    }
    oframe(dt) {
        
    }
}


const changeTexture = (particle,max) => {
    particle.texture = particle.textures[`${particle.path}${Math.floor(Math.random() * max)}`];
}
export const transform = (rot,offset) => {
    return new v2(Math.cos(rot) * offset.x - Math.sin(rot) * offset.y,Math.sin(rot) * offset.x + Math.cos(rot) * offset.y);
}

const draw = (entity,layer,buffer,dt) => {
    if (entity.destroyed) { return; }
    if (entity.invisible) { return; }
    let texture = entity.texture;
    if (entity.flash) { texture = entity.flashtexture; }
    if (!entity.texture) { return; }

    if (entity.iframes) { buffer.Draw.globalAlpha = 0.5 + Math.round(entity.iframes % 0.25 * 4) / 2; }
    buffer.Draw.resetTransform();
    buffer.Draw.clearRect(0,0,entity.size.x,entity.size.y);
    const rot = entity.rot;
    buffer.Draw.setTransform(Math.cos(rot),Math.sin(rot),-Math.sin(rot),Math.cos(rot),entity.size.x / 2,entity.size.y / 2);

    buffer.Draw.drawImage(texture.Buffer,-entity.size.x / 2,-entity.size.y / 2);

    let pos = entity.pos.add(GetShake());

    let x = pos.x - entity.size.x / 2;
    let y = pos.y - entity.size.y / 2;

    if (entity.lastpos) {
        let p = entity.lastpos.sub(pos).divide(1.5);
        layer.Draw.globalAlpha = 0.45;
        layer.Draw.drawImage(buffer.Buffer,x + p.x,y + p.y);
        layer.Draw.drawImage(buffer.Buffer,x - p.x,y - p.y);
        layer.Draw.globalAlpha = 1;
    }
    entity.lastpos = pos;
    layer.Draw.drawImage(buffer.Buffer,x,y);
}

const entities = [];

export class entity {
    constructor(name,size,hitbox,layer,textures) {
        this.name = name;

        this.layer = layer;
        this.buffer = BlankBuffer(size.x,size.y);
        this.textures = textures;
        this.flashtexture = textures.flash;
        this.pos = new v2(0,0);
        this.velocity = new v2(0,0);
        this.size = size;
        this.hitbox = hitbox;
        this.rot = 0;
        this.trot = 0;
        this.turnspeed = 5;
        table.insert(entities,this);
    }
    emitters = [];
    activecollisions = [];

    async damage(dmg, damager) {
        if (this.inactive) { return; }
        if (this.iframes && !damager.ignoreIframes && (!this.idamage || this.idamage >= dmg)) { return; }
        this.flash = 0.1;
        this.iframes = this.inv;
        this.idamage = dmg;
        if (this.damagemultiplier) { dmg *= this.damagemultiplier; }

        if (this.toughness) { dmg = Math.max(1,dmg - Math.min(this.maxhealth * 0.8,dmg * Math.min(dmg - 5,40) * this.toughness / 180)); }
        if (this.defense) { dmg = Math.max(1,dmg - this.defense); }

        this.health = Math.max(0,this.health - dmg);

        if (this.ondamage) { this.ondamage(this,dmg,damager); }
        if (this.health <= 0) {
            if (this.score) { AddScore(this.score,this.pos.x,this.pos.y); }
            if (this.deathEffect) { await this.deathEffect(this); }
            this.died();
        }
    }
    heal(heal) {
        this.health = Math.min(this.maxhealth,this.health + heal);
        if (this.ondamage) { this.ondamage(this,-heal); }
    }
    
    destroy() {
        if (this.removing) {this.removing(); }
        Remove(this.event);
        table.remove(entities,this);
        Destroy(this);
        this.destroyed = true;
    }
    frame(dt) {
        if (!this) { return; }
        if (this.flash) { this.flash -= dt; if (this.flash <= 0) { this.flash = null; }}
        if (this.iframes) { this.iframes -= dt; if (this.iframes <= 0) { this.iframes = null; this.buffer.Draw.globalAlpha = 1; }}
        if (this.destroyed) { return; }
        
        this.pos = this.pos.add(this.velocity.multiply(dt));
        if (!this.oob) { this.pos = this.pos.clamp(new v2(0,0), new v2(width, height)); }
        this.outside = this.pos.x < -this.size.x - 64 || this.pos.x > width + this.size.x + 64 || this.pos.y < -this.size.y - 64 || this.pos.y > height + this.size.y + 64;
        this.rot = TurnTowards(this.rot,this.trot,dt * this.turnspeed);
        if (this.rot != this.rot) { this.rot = 0; }

        this.emitters.map(emitter => {
            if (!emitter) { return; }
            emitter.frame(dt);
        });
        if (this.nocollisioncheck) { return; }
        collide(this,dt);
    }
    render(dt) {
        if (this.destroyed) { return; }
        draw(this,this.layer,this.buffer,dt);
        this.emitters.map(emitter => {
            if (!emitter) { return; }
            emitter.render();
        })
    }
}
export class AmbientEntity extends entity {
    constructor(name,size,hitbox,layer,textures) {
        super(name, size, hitbox, layer, textures);
        this.nocollision = true;
    }
}
export const damagetypes = {
    explosion: {

    }
}

const addcollision = (entity, target) => {
    table.insert(entity.collisions,target);
}
const collision = (entity1, entity2, dt) => {
    if ((entity1.nosamegroup || entity2.nosamegroup) && entity1.group == entity2.group) { return; }
    if (entity1.isProjectile && entity2.isProjectile) { return; }
    let weight1 = entity1.weight || 1, weight2 = entity2.weight || 1;
    let vel1 = entity1.velocity;
    let vel2 = entity2.velocity;

    if (!entity1.unmovable) {
        if (entity2.isProjectile) {
            if (table.find(entity1.activecollisions,entity2)) { return; }
            entity1.velocity = entity1.velocity.add(vel2.multiply(weight2 / weight1));
        } else {
            let d = entity1.pos.sub(entity2.pos);
            let w = 0;
            let h = 0;
            if (typeof entity1.hitbox == "number") { w += entity1.hitbox / 2; h += entity1.hitbox / 2 } else { w += entity1.hitbox.x / 2; h += entity1.hitbox.y / 2; }
            if (typeof entity2.hitbox == "number") { w += entity2.hitbox / 2; h += entity2.hitbox / 2; } else { w += entity2.hitbox.x / 2; h += entity2.hitbox.y / 2; }
        
            let dd = new v2(d.x - Math.sign(d.x) * (w),d.y - Math.sign(d.y) * (h));
            if (Math.abs(d.y) >= h) { dd.y = 0; }
            if (Math.abs(d.x) >= w) { dd.x = 0; }
            
            dd = dd.multiply(dt * 8);
            entity1.pos = entity1.pos.sub(dd);
            entity2.pos = entity2.pos.add(dd);
        }
    }
    if (!entity2.unmovable) {
        let d = entity2.pos.sub(entity1.pos);
        entity2.velocity = entity2.velocity.add(d.unit().multiply(64 - d.magnitude()).multiply(dt));
    }
    

    //if (entity1.hit) { entity1.hit(entity2); }
    //if (entity2.hit) { entity2.hit(entity1); }

    if (entity1.group == entity2.group) {return; }
    if (table.find(entity1.activecollisions,entity2)) { return; }
    
    
    if (entity1.hit) { entity1.hit(entity2); }
    if (entity2.hit) { entity2.hit(entity1); }

    entity1.damage(entity2.dmg || 1,entity2);
    entity2.damage(entity1.dmg || 1,entity1);
}

const intersectCircle = (circle, rect) => {
    const d = circle.pos.sub(rect.pos).abs();

    if (d.x > circle.hitbox + rect.hitbox.x / 2) { return false; }
    if (d.y > circle.hitbox + rect.hitbox.y / 2) { return false; }

    if (d.x < rect.hitbox.x / 2) { return true; }
    if (d.y < rect.hitbox.y / 2) { return true; }

    return d.sub(rect.hitbox.multiply(0.5)).magnitude() <= (circle.hitbox * circle.hitbox);
}
const collide = (target,dt) => {
    if (target.nocollision) { return; }
    if (target.destroyed) { return; }
    if (target.inactive) { return; }
    target.collisions = [];
    table.iterate(entities,entity => {
        if (!entity) { return; }
        if (entity.nocollision) { return; }
        if (entity.inactive) { return; }
        if (entity.destroyed) { return; }
        if (target == entity) { return; }
        
        if (typeof entity.hitbox == "number") {
            if (typeof target.hitbox == "number") {
                if (entity.pos.sub(target.pos).magnitude() > target.hitbox + entity.hitbox) { return; }
            } else {
                if (!intersectCircle(entity,target)) { return; }
            }
        } else {
            if (typeof target.hitbox == "number") {
                if (!intersectCircle(target,entity)) { return; }
            } else {
                if (Math.abs(target.pos.x - entity.pos.x) > target.hitbox.x / 2 + entity.hitbox.x / 2) { return; }
                if (Math.abs(target.pos.y - entity.pos.y) > target.hitbox.y / 2 + entity.hitbox.y / 2) { return; }
            }
        }
        
        addcollision(target,entity);
        return collision(target,entity,dt);
    });

    if (!target.collisions) { return; }
    table.iterate(target.activecollisions, entity => {
        if (table.find(target.collisions,entity)) { return; }
        table.remove(target.activecollisions, entity);
    });
    table.iterate(target.collisions, entity => {
        if (table.find(target.activecollisions,entity)) { return; }
        table.insert(target.activecollisions,entity);
    });
}

class projectile {
    constructor(name,group,pos,velocity,size,hitbox,layer,textures) {
        this.name = name;
        this.group = group;

        this.layer = layer;
        this.buffer = BlankBuffer(size.x,size.y);
        this.textures = textures;
        this.pos = pos;
        this.velocity = velocity;
        this.size = size;
        this.hitbox = hitbox;
        this.rot = Math.atan2(-velocity.x,velocity.y);
        this.pierce = 0;

        this.fr = Add(dt => {
            this.frame(dt);
            this.render(dt);
        })
        table.insert(entities,this);
    }
    isProjectile = true;
    activecollisions = [];
    destroy() {
        Remove(this.fr);
        table.remove(entities,this);
        this.destroyed = true;
        Destroy(this);
    }
    
    damage(dmg,target) {
        this.hit(target);
        this.pierce -= 1;
        if (this.pierce >= 0) { return; }
        this.destroy();
        return -1;
    }
    frame(dt) {
        if (this.ai) { if (this.ai(dt)) { return; } }

        this.lifetime -= dt;
        if (this.lifetime <= 0) { this.destroy(); return; }
        this.pos = this.pos.add(this.velocity.multiply(dt));
        if ((this.pos.x < -this.size.x || this.pos.x > width + this.size.x) || (this.pos.y < -this.size.y || this.pos.y > height + this.size.y)) {
            this.destroy();
            return;
        }

        //collide(this,dt);
    }
    render(dt) {
        draw(this,this.layer,this.buffer,dt);
    }
}

export class LaserProjectile extends projectile {
    constructor(name,group,pos,velocity,size,hitbox,layer,textures) {
        super(name,group,pos,velocity,size,hitbox,layer,textures);

        this.nosamegroup = true;
        this.unmovable = true;
        this.lifetime = 5;
    }

    hit(target) {
        if (this.latching) {
            this.latch(target);
        }
        if (!target.emitters) { return; }
        const emit = new LaserHitParticleEmitter("Laserhit",0,target,new v2(0,0),this.textures2,new v2(9,9));
        for (let i=0;i < 2; i ++) { emit.emit(); }
    }
    latch(target) {
        if (this.latchtarget) { return; }
        this.latchtarget = target;
        this.latchtimer = 0;
    }
    ai(dt) {
        if (!this.latchtarget) { return; }
        if (!this.latchtarget.health || this.latchtarget.destroyed) { return; }

        this.pos = this.latchtarget.pos.add(new v2(Math.random() - 0.5,Math.random() - 0.5).multiply(4));
        this.latchtimer += dt * this.latching;
        if (this.latchtimer >= 1) { this.latchtimer -= 1; this.latchtarget.damage(this.dmg,this); this.damage(1,this.latchtarget); }
        return true;
    }
}
export class ExplosionProjectile extends projectile {
    constructor(name,group,pos,velocity,size,hitbox,layer,textures) {
        super(name,group,pos,velocity,size,hitbox,layer,textures);

        this.lifetime = 0.1;
        this.pierce = Infinity;
        this.unmovable = true;
        this.weight = 5;
        this.dmg = 50;
        this.nosamegroup = true;
        this.damagetype = damagetypes.explosion;

        Shake(3,1);
    }

    hit(target) {
        target.velocity = target.velocity.add(target.pos.sub(this.pos).unit().multiply(400 / (target.weight || 1)));
    }
}