import { table } from "../lib/table.js";
import { BlankBuffer } from "../lib/texture.js";
import { height, width } from "../renderer/render.js";

class Scale {
    constructor(scale, offset) {
        this.scale = scale;
        this.offset = offset;
    }
}
export class Scale2 {
    constructor(xscale, xoffset, yscale, yoffset) {
        this.x = new Scale(xscale, xoffset);
        this.y = new Scale(yscale, yoffset);
    }

    add(s2) {
        return new Scale2(this.x.scale + s2.x.scale,this.x.offset + s2.x.offset,this.y.scale + s2.y.scale,this.y.offset + s2.y.offset);
    }
}
export class Anchor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

        this.update();
    }
    r = 0;
    b = 0;
    g = 0;
    a = 0;
    hex = "";
    
    setColor(r, b, g, a) {
        if (r) { this.r = r; }
        if (g) { this.g = g; }
        if (b) { this.b = b; }
        if (a) { this.a = a; }

        this.update();
    }
    update() {
        this.hex = `#${this.r.toString(16).padEnd(2,"0")}${this.g.toString(16).padEnd(2,"0")}${this.b.toString(16).padEnd(2,"0")}${(255 - this.a).toString(16).padEnd(2,"0")}`;
    }
}


const redraw = (c,p,l) => {
    if (!c) { return; }
    table.pairs(c,(index, item) => {
        if (!item) { return; }
        item.buffer = l;
        item.parent = p;
        item.draw();
        redraw(item.children,item,l);
    });
}


export class UILayer {
    constructor(layer) {
        this.layer = layer;
        this.width = width;
        this.height = height;
    }
    px = 0;
    py = 0;
    children = {};

    addChild(c) {
        table.insert(this.children,c);
    }
    redraw() {
        this.layer.Draw.clearRect(0,0,this.width,this.height);

        redraw(this.children,this,this.layer);
    }
}


class UIObject {
    constructor(pos, size, anchor, children) {
        this.pos = pos;
        this.size = size;
        this.anchor = anchor;
        this.children = children || {};
    }
    children = {};

    destroy() {
        table.remove(this.parent.children,this);
    }
    redraw() {
        if (!this.parent) { return; }
        this.parent.redraw();
    }
    draw() {
        if (this.invisible) { return; }
        let px = this.pos.x.scale * this.parent.width + this.pos.x.offset;
        let py = this.pos.y.scale * this.parent.height + this.pos.y.offset;

        let sx = this.size.x.scale * this.parent.width + this.size.x.offset;
        let sy = this.size.y.scale * this.parent.height + this.size.y.offset;

        this.width = sx;
        this.height = sy;

        let x = this.parent.px + px - sx * this.anchor.x;
        let y = this.parent.py + py - sy * this.anchor.y;

        this.px = x;
        this.py = y;
        
        this.render(x,y,sx,sy);
    }
}
export class Frame extends UIObject {
    constructor(obj,children) {
        super(obj.pos, obj.size, obj.anchor, children);
        this.color = obj.color;
    }

    render(x,y,width,height) {
        let ctx = this.buffer.Draw;

        ctx.fillStyle = this.color.hex;
        ctx.fillRect(x,y,width,height);
    }
}
export class Text extends UIObject {
    constructor(obj) {
        super(obj.pos, obj.size, obj.anchor);
        this.color = obj.color;
        this.text = obj.text;
        this.font = `${obj.textsize}px sans-serif`;
    }

    render(x,y,width,height) {
        let ctx = this.buffer.Draw;

        ctx.fillStyle = this.color.hex;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = this.font;
        
        ctx.fillText(this.text,x + width / 2,y + height / 2);
    }
}