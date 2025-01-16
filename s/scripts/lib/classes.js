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

export const TurnTowards = (angle,targetAngle,speed) => {
    const d = targetAngle - angle;
    if (Math.abs(d) <= speed) { return targetAngle; }

    let u = Math.sign(d);
    if (Math.abs(d) > Math.PI) { u = -u; }
    return (angle + u * speed + u * Math.PI) % (Math.PI * 2) - u * Math.PI;
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
        if (this.cooldown >= 1) {
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

        particle.pos = particle.pos.add(this.target.velocity.multiply(dt));
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
}


const changeTexture = (particle,max) => {
    particle.texture = particle.textures[`${particle.path}${Math.round(Math.random() * max)}`];
}
const transform = (rot,offset) => {
    return new v2(Math.cos(rot) * offset.x - Math.sin(rot) * offset.y,Math.sin(rot) * offset.x + Math.cos(rot) * offset.y);
}

const draw = (entity,layer,buffer) => {
    buffer.Draw.resetTransform();
    buffer.Draw.clearRect(0,0,entity.size.x,entity.size.y);
    const rot = entity.rot;
    buffer.Draw.setTransform(Math.cos(rot),Math.sin(rot),-Math.sin(rot),Math.cos(rot),entity.size.x / 2,entity.size.y / 2);
    buffer.Draw.drawImage(entity.texture.Buffer,-entity.size.x / 2,-entity.size.y / 2);

    layer.Draw.drawImage(buffer.Buffer,Math.round(entity.pos.x - entity.size.x / 2),Math.round(entity.pos.y - entity.size.y / 2));
}

export class entity {
    constructor(name,size,layer,textures) {
        this.name = name;

        this.layer = layer;
        this.buffer = BlankBuffer(size.x,size.y);
        this.textures = textures;
        this.pos = new v2(0,0);
        this.velocity = new v2(0,0);
        this.size = size;
        this.rot = 0;
        this.trot = 0;
    }
    emitters = [];

    frame(dt) {
        this.pos = this.pos.add(this.velocity.multiply(dt)).clamp(new v2(0,0), new v2(width, height));
        this.rot = TurnTowards(this.rot,this.trot,dt * 7);

        this.emitters.map(emitter => {
            if (!emitter) { return; }
            emitter.frame(dt);
        })
    }
    render() {
        draw(this,this.layer,this.buffer);
        this.emitters.map(emitter => {
            if (!emitter) { return; }
            emitter.render();
        })
    }
}