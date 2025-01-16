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


class Particles {
    constructor(name,rate,entity,offset,textures,size,) {
        this.name = name;
        
        this.rate = rate;
        this.offset = offset;
        this.textures = textures;
        table.insert(entity.emitters,this);
    }
    cooldown = 0;
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
    }
    render() {
        this.buffer.Draw.resetTransform();
        this.buffer.Draw.clearRect(0,0,this.size.x,this.size.y);
        const rot = this.rot;
        this.buffer.Draw.setTransform(Math.cos(rot),Math.sin(rot),-Math.sin(rot),Math.cos(rot),this.size.x / 2,this.size.y / 2);
        this.buffer.Draw.drawImage(this.texture.Buffer,-this.size.x / 2,-this.size.y / 2);

        this.layer.Draw.drawImage(this.buffer.Buffer,Math.round(this.pos.x - this.size.x / 2),Math.round(this.pos.y - this.size.y / 2));
    }
}