import { width } from "../renderer/render";

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

    unit() {
        if (this.x == 0 && this.y == 0) { return this; }

        const d = Math.sqrt(this.x * this.x + this.y * this.y);
        return new v2(this.x / d, this.y / d);
    }
}

export class entity {
    constructor(name,size,layer,texture) {
        this.name = name;

        this.layer = layer;
        this.buffer = texture;
        this.pos = new v2(0,0);
        this.velocity = new v2(0,0);
        this.size = size;
        this.rot = 0;
        this.trot = 0;

        console.log(texture);
        console.log(this.layer);
    }

    frame(dt) {
        this.pos = this.pos.add(this.velocity.multiply(dt));
        if (this.pos.x < 0 || this.pos.x > width) { this.velocity = this.velocity.sub(new v2(this.velocity.x * 2,0)); }
    }
    render() {
        this.layer.Draw.drawImage(this.buffer.Buffer,Math.round(this.pos.x - this.size.x / 2),Math.round(this.pos.y - this.size.y / 2));
    }
}