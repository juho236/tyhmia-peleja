import { screenX, screenY } from "../../engine/info.js";
import { CreateBlankBuffer } from "../../engine/renderer/buffer/buffer.js";
import { RenderLayered } from "../../engine/renderer/render.js";
import { RenderLayer } from "../../engine/renderer/ui/uirender.js";
import { Scale2, Vector2 } from "../position.js";
import { Table } from "../table.js";

export class UILayer {
    constructor(layer,z) {
        this.Z = z;
        this.buffer = CreateBlankBuffer(screenX,screenY);
        this.layer = layer;
        this.children = new Table();
        layer.Items.insert(this);
    }
    destroy() {
        this.layer.Items.remove(this);
        this.buffer.Draw.clearRect(0,0,screenX,screenY);
        RenderLayer(this);
    }
    changed = false;
    enabled = true;

    addChild(c) {
        this.children.insert(c);
        c.addParent(this);

        this.changed = true;
    }
    render(t,dt) {
        if (!this.enabled) { return; }
        if (this.changed) { this.draw(); }
        this.changed = false;
        RenderLayer(this,t,dt);
    }
    draw() {
        this.buffer.Draw.clearRect(0,0,screenX,screenY);
        this.children.iterate(c => {
            c.draw(0,0,screenX,screenY);
        });
    }
}

export class UIBase {
    constructor(pos,size,anchor,color,z) {
        this.pos = pos || new Scale2(0,0,0,0);
        this.size = size || new Scale2(0,100,0,100);
        this.anchor = anchor || new Vector2(0,0);
        this.color = color || Colors.Transparent;
        this.Z = z || 0;

        this.children = new Table();
    }

    updateparent() {
        if (!this.parent) { return; }

        this.parent.changed = true;
    }

    visible = true;
    color;
    pos;
    size;
    anchor;
    set color(n) {
        this.visible = n.a > 0;
        this.updateparent();
    }
    set pos(n) {
        this.updateparent();
    }
    set size(n) {
        this.updateparent();
    }
    set anchor(n) {
        this.updateparent();
    }

    addChild(c) {
        this.children.insert(c);
        c.addParent(this.parent);

        this.updateparent();
    }
    addParent(p) {
        this.parent = p;
        this.children.iterate(c => { c.addParent(p); });
    }
    draw(px,py,sx,sy) {
        let psx = sx;
        let psy = sy;
        sx = this.size.scaleX * sx + this.size.offsetX;
        sy = this.size.scaleY * sy + this.size.offsetY;
        px += this.pos.offsetX + this.pos.scaleX * psx - this.anchor.X * sx;
        py += this.pos.offsetY + this.pos.scaleY * psy - this.anchor.Y * sy;

        if (this.visible && this.render) { this.render(px,py,sx,sy) };
        this.children.iterate(c => { c.draw(px,py,sx,sy); });
    }
}


export class Color3 {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

        if (a === undefined) { this.a = 255; }

        this.update();
    }
    r = 0;
    b = 0;
    g = 0;
    a = 0;
    hex = "";
    
    clone() {
        return new Color3(this.r,this.g,this.b,this.a);
    }
    setColor(r, b, g, a) {
        const n = this.clone();
        if (r) { n.r = r; }
        if (g) { n.g = g; }
        if (b) { n.b = b; }
        if (a) { n.a = a; }

        n.update();
    }
    update() {
        this.hex = `#${this.r.toString(16).padEnd(2,"0")}${this.g.toString(16).padEnd(2,"0")}${this.b.toString(16).padEnd(2,"0")}${(this.a).toString(16).padEnd(2,"0")}`;
    }
}
export const Colors = {
    Black: new Color3(0,0,0),
    White: new Color3(255,255,255),
    Transparent: new Color3(0,0,0,0)
}
export const Sizes = {
    Fullscreen: new Scale2(1,0,1,0),
}