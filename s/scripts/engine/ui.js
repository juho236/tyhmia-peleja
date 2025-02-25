import { table } from "../lib/table.js";
import { BlankBuffer } from "../lib/texture.js";
import { AddMouseEvent, height, width } from "../renderer/render.js";
import { Add, AddIndependent, RemoveIndependent } from "./frame.js";

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
    lerp(s2,t) {
        return new Scale2(this.x.scale + (s2.x.scale - this.x.scale) * t,this.x.offset + (s2.x.offset - this.x.offset) * t,this.y.scale + (s2.y.scale - this.y.scale) * t,this.y.offset + (s2.y.offset - this.y.offset) * t)
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

let uilayers = [];

export class UILayer {
    constructor(layer) {
        this.layer = layer;
        this.buffer = BlankBuffer(width,height);
        this.buffer2 = BlankBuffer(width,height);
        this.width = width;
        this.height = height;
        this.event = AddIndependent(dt => {
            if (!this.updated) { return; }
            this.updated = false;

            this.redraw();
        });        

        table.insert(uilayers,this);
    }
    updated = false;
    px = 0;
    py = 0;
    children = {};

    remove() {
        RemoveIndependent(this.event);
    }
    addChild(c) {
        table.insert(this.children,c);
    }
    redraw() {
        this.updated = true;
        this.layer.Draw.clearRect(0,0,this.width,this.height);

        redraw(this.children,this,this.layer);
    }
}


class UIObject {
    constructor(pos, size, anchor, children) {
        this.pos = pos || new Scale2(0,0,0,0);
        this.size = size || new Scale2(0,0,0,0);
        this.anchor = anchor || new Anchor(0,0);
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


        let x = this.parent.px + px - sx * this.anchor.x;
        let y = this.parent.py + py - sy * this.anchor.y;

        if (this.width != sx || this.height != sy) {
            this.width = this.width || 0;
            this.height = this.height || 0;

            let dw = (sx - this.width) / 1.5;
            let dh = (sy - this.height) / 1.5;

            let w1 = sx - dw;
            let h1 = sy - dh;
            let x1 = this.parent.px + px - w1 * this.anchor.x;
            let y1 = this.parent.py + py - h1 * this.anchor.y;
            
            let w2 = sx + dw;
            let h2 = sy + dh;
            let x2 = this.parent.px + px - w2 * this.anchor.x;
            let y2 = this.parent.py + py - h2 * this.anchor.y;

            this.buffer.Draw.globalAlpha = 0.45;
            this.render(x1,y1,w1,h1);
            this.render(x2,y2,w2,h2);
            this.buffer.Draw.globalAlpha = 1;
        }

        this.render(x,y,sx,sy);
        
        this.width = sx;
        this.height = sy;
        this.px = x;
        this.py = y;
    }
}
export class Frame extends UIObject {
    constructor(obj,children) {
        super(obj.pos, obj.size, obj.anchor, children);
        this.color = obj.color || new Color(255,255,255,0);

        if (obj.onclick || obj.onhover || obj.onleave) { this.canclick = true; }
        this.onclick = obj.onclick;
        this.onhover = obj.onhover;
        this.onleave = obj.onleave;
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
        this.color = obj.color || new Color(255,255,255,0);
        this.text = obj.text;
        this.font = `${obj.textsize}px system-ui`;
        this.textsize = obj.textsize;
    }

    render(x,y,width,height) {
        let ctx = this.buffer.Draw;

        ctx.fillStyle = this.color.hex;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = this.font;

        let currentline = "";
        let lines = [];
        this.text.split(" ").map(word => {
            let newline = currentline + " " + word;
            let w = ctx.measureText(newline).width;
            if (w >= width) {
                table.insert(lines,currentline);
                currentline = word;
                return;
            }
            currentline = newline;
        });
        table.insert(lines,currentline);
        let lineheight = this.textsize;

        table.iterate(lines,(line, index) => {
            ctx.fillText(line,x + width / 2,y+ lineheight / 2 + index * lineheight);
        });
    }
}
export class Image extends UIObject {
    constructor(obj) {
        super(obj.pos, obj.size, obj.anchor);
        this.image = obj.image;
    }

    render(x,y,width,height) {
        let ctx = this.buffer.Draw;
    
        ctx.drawImage(this.image.Buffer,x,y,width,height);
    }
}

let obj;
const recurse = (c,x,y) => {
    if (!c) { return; }
    table.pairs(c,(index, item) => {
        recurse(item.children,x,y);

        if (!item.canclick) { return; }
        if (obj) { return; }

        if (x < item.px || x > item.px + item.width) { return; }
        if (y < item.py || y > item.py + item.height) { return; }

        obj = item;
    });
}

export const Load = canvas => {
    AddMouseEvent((x,y) => {
        if (obj && obj.onleave) { obj.onleave(obj); } 
        obj = undefined;
        recurse(uilayers,x,y);
        
        if (!obj) {
            canvas.style.cursor = "initial";
            return;
        }
        canvas.style.cursor = "pointer";
        if (obj.onhover) { obj.onhover(obj); }
    });
    canvas.onclick = () => {
        if (!obj) { return; }
        if (obj.onclick) { obj.onclick(obj); }
    }
}



export const toSize = async (ui, bg, target, time) => {
    let initial = bg.size;
    let t = 0;

    await new Promise(completed => {
        let e;
        e = AddIndependent(dt => {
            t += dt / time;
            if (t > 1) {
                bg.size = target;

                RemoveIndependent(e);
                completed();
                return;
            }

            bg.size = initial.lerp(target,t);
            ui.redraw();
        });
    })
}