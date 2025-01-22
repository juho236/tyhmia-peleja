import { Add, Remove } from "../engine/frame.js";
import { height, width } from "../renderer/render.js";
import { table } from "./table.js";
import { BlankBuffer } from "./texture.js";

export class v2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
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

    clamp(min, max) {
        return new v2(Math.min(Math.max(this.x,min.x),max.x),Math.min(Math.max(this.y,min.y),max.y));
    }
    unit() {
        if (this.x == 0 && this.y == 0) { return this; }

        const d = Math.sqrt(this.x * this.x + this.y * this.y);
        return new v2(this.x / d, this.y / d);
    }
}

export const ClampAngle = angle => {
    let u = Math.sign(angle);
    return (angle + u * Math.PI) % (Math.PI * 2) - u * Math.PI;
}

export const TurnTowards = (angle,targetAngle,speed) => {
    const d = targetAngle - angle;
    if (Math.abs(d) <= speed) { return ClampAngle(targetAngle); }

    let u = Math.sign(d);
    if (Math.abs(d) > Math.PI) { u = -u; }
    return ClampAngle(angle + u * speed);
}


class ParticleEmitter {
    constructor(name,rate,entity,offset,textures,size) {
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
        table.insert(this.particles,this.new());
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
                table.remove(this.particles,particle);
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
        particle.velocity = particle.velocity.add(new v2(0,this.target.speed / 100).multiply(dt));
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

        particle.pos = this.target.pos.add(transform(this.target.rot,this.offset))
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
export class trailParticleEmitter extends RandomEmit {
    constructor(name,rate,entity,offset,textures,size) {
        super(name,rate,entity,offset,textures,size);
    }

    new() {
        const rot = this.target.rot + (Math.random() - 0.5) / 2;
        const obj = {
            pos: this.target.pos.add(transform(rot,this.offset)),
            rot: Math.random() * 2 * Math.PI,
            size: this.size,
            velocity: new v2(-Math.sin(rot),Math.cos(rot)).multiply(60 + Math.random() * 40),
            lifetime: 1,
            textures: this.textures,
            buffer: BlankBuffer(this.size.x,this.size.y),
            animation: 0,
            path: "full",
            options: 3
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

        obj.texture = obj.textures.frame0;
        return obj;
    }
    oframe(dt) {
        
    }
}


const changeTexture = (particle,max) => {
    particle.texture = particle.textures[`${particle.path}${Math.floor(Math.random() * max)}`];
}
const transform = (rot,offset) => {
    return new v2(Math.cos(rot) * offset.x - Math.sin(rot) * offset.y,Math.sin(rot) * offset.x + Math.cos(rot) * offset.y);
}

const draw = (entity,layer,buffer) => {
    if (entity.invisible) { return; }
    if (!entity.texture) { return; }
    buffer.Draw.resetTransform();
    buffer.Draw.clearRect(0,0,entity.size.x,entity.size.y);
    const rot = entity.rot;
    buffer.Draw.setTransform(Math.cos(rot),Math.sin(rot),-Math.sin(rot),Math.cos(rot),entity.size.x / 2,entity.size.y / 2);
    buffer.Draw.drawImage(entity.texture.Buffer,-entity.size.x / 2,-entity.size.y / 2);

    layer.Draw.drawImage(buffer.Buffer,Math.round(entity.pos.x - entity.size.x / 2),Math.round(entity.pos.y - entity.size.y / 2));
}

const entities = [];

export class entity {
    constructor(name,size,hitbox,layer,textures) {
        this.name = name;

        this.layer = layer;
        this.buffer = BlankBuffer(size.x,size.y);
        this.textures = textures;
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

    damage(dmg) {
        this.health -= dmg;
        if (this.health <= 0) { this.died(); }
    }
    
    destroy() {
        if (this.removing) {this.removing(); }
        Remove(this.event);
        table.remove(entities,this);
        this.destroyed = true;
    }
    frame(dt) {
        this.pos = this.pos.add(this.velocity.multiply(dt));
        if (!this.oob) { this.pos = this.pos.clamp(new v2(0,0), new v2(width, height)); }
        this.outside = this.pos.x < -this.size.x || this.pos.x > width + this.size.x || this.pos.y < -this.size.y || this.pos.y > height + this.size.y;
        this.rot = TurnTowards(this.rot,this.trot,dt * this.turnspeed);
        if (this.rot != this.rot) { this.rot = 0; }

        this.emitters.map(emitter => {
            if (!emitter) { return; }
            emitter.frame(dt);
        });
        collide(this);
    }
    render() {
        draw(this,this.layer,this.buffer);
        this.emitters.map(emitter => {
            if (!emitter) { return; }
            emitter.render();
        })
    }
}

const collide = target => {
    if (target.inactive) { return; }
    table.iterate(entities,entity => {
        if (!entity) { return; }
        if (entity.group == target.group) { return; }
        if (entity.inactive) { return; }
        
        if (Math.abs(target.pos.x - entity.pos.x) > target.hitbox.x + entity.hitbox.x) { return; }
        if (Math.abs(target.pos.y - entity.pos.y) > target.hitbox.y + entity.hitbox.y) { return; }
        if (!entity.health) { return; } 
        entity.damage(1);
        if (target.isProjectile) {
            target.pierce -= 1;
            if (target.pierce < 0) { target.destroy(); }
        }
    })}

export class projectile {
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
            this.render();
        })
        table.insert(entities,this);
    }
    isProjectile = true;
    destroy() {
        Remove(this.fr);
        table.remove(entities,this);
    }
    
    frame(dt) {
        this.pos = this.pos.add(this.velocity.multiply(dt));
        if ((this.pos.x < -this.size.x || this.pos.x > width + this.size.x) || (this.pos.y < -this.size.y || this.pos.y > height + this.size.y)) {
            this.destroy();
        }

        collide(this);
    }
    render() {
        draw(this,this.layer,this.buffer);
    }
}