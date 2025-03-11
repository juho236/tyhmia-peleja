import { screenX, screenY, unitScale } from "../../engine/info.js";
import { CreateBlankBuffer } from "../../engine/renderer/buffer/buffer.js";
import { AddEntity } from "../../engine/tick/tick.js";
import { GetCamera } from "../../game/camera/camera.js";
import { Vector2 } from "../position.js";


export class EntityBase {
    constructor(pos,size,z,layer) {
        this.pos = pos || new Vector2(0,0);
        this.size = size || new Vector2(0,0)
        this.rotation = 0;
        this.velocity = new Vector2(0,0);

        this.Z = z || 0;
        this.changed = true;
        this.layer = layer;
        this.preRender();
        this.prepareRender();
        layer.Items.insert(this);
    }
    pos;
    velocity;
    rotation;
    set rotation(r) {
        if (this.rotation == r) { return; }
        this.changed = true;
    }
    size;
    Z;
    changed = false;
    update() {
        this.changed = true;
    }

    logic(dt) {
        if (this.physics) { this.physics(dt); }
    }
    start() {
        AddEntity(this);
    }
    preRender() {
        this.pos0 = this.pos;
        this.size0 = this.size;
        this.rotation0 = this.rotation;
    }
    prepareRender() {
        this.pos1 = this.pos;
        this.size1 = this.size;
        this.rotation1 = this.rotation;
    }
}
export class TextureEntityBase extends EntityBase {
    constructor(pos,size,z,layer,texture) {
        super(pos,size,z,layer);

        this.texture = texture;
        this.buffer = CreateBlankBuffer(size.X,size.Y);
        this.rotationbuffer = CreateBlankBuffer(0,0);
        this.updaterotationbuffer();
    }
    visible = true;

    updaterotationbuffer() {
        let w = Math.max(this.buffer.Buffer.width,this.buffer.Buffer.height);
        this.rotationbuffer.Buffer.width = w * 2;
        this.rotationbuffer.Buffer.height = w * 2;
    }
    drawBase(t,dt) {
        this.buffer.Buffer.width = this.size.X * unitScale;
        this.buffer.Buffer.height = this.size.Y * unitScale;
        this.updaterotationbuffer();

        this.buffer.Draw.clearRect(0,0,this.buffer.Buffer.width,this.buffer.Buffer.height);
        this.draw(t,dt);
        
        let width = this.buffer.Buffer.width;
        let height = this.buffer.Buffer.height;
        let w = this.rotationbuffer.Buffer.width;
        let h = this.rotationbuffer.Buffer.height;
        this.rotationbuffer.Draw.resetTransform();
        this.rotationbuffer.Draw.clearRect(0,0,w,h);
        const rot = this.rotation0 + (this.rotation1 - this.rotation0) * t;
        this.rotationbuffer.Draw.setTransform(Math.cos(rot),Math.sin(rot),-Math.sin(rot),Math.cos(rot),w / 2,h / 2);
        this.rotationbuffer.Draw.drawImage(this.buffer.Buffer,-w / 2 + width / 2,-h / 2 + height / 2);
    }

    render(t,dt) {
        if (!this.visible) { return; }
        if (!this.texture) { return; }
        if (this.changed) { this.drawBase(t,dt); }
        this.changed = false;

        const cam = GetCamera();
        const pos = this.pos0.lerp(this.pos1,t);
        const Z = (cam.Z - this.Z) / 4;
        if (Z <= 0) { return; }
        //if (Math.abs(cam.X - pos.X))
        let x = pos.X - cam.X;
        let y = pos.Y - cam.Y;

        let xp = x * unitScale / Z;
        let yp = y * unitScale / Z;

        let width = this.buffer.Buffer.width;
        let height = this.buffer.Buffer.height;
        let w = this.rotationbuffer.Buffer.width;
        let h = this.rotationbuffer.Buffer.height;

        x -= this.size.X / 2;
        y -= this.size.Y / 2;

        x *= unitScale / Z;
        y *= unitScale / Z;

        let xd = Math.abs(xp) - width / 2 / Z;
        let yd = Math.abs(yp) - height / 2 / Z;
        if (xd > screenX / 2) { return; }
        if (yd > screenY / 2) { return; }

        let clipX = 0;
        let clipY = 0;

        let xmax = screenX;
        let xmin = xmax / 2;

        if (-x > xmin) { clipX -= xmin + x; }

        let clipWidth = clipX;
        let clipHeight = clipY;

        let ww = width / 2 + xp;
        
        if (ww > xmax) { clipWidth += ww - xmax; }
        console.log((width - clipWidth) / Z); 

        //this.layer.Draw.drawImage(this.rotationbuffer.Buffer,clipX,clipY,w - clipWidth,h - clipHeight,Math.floor(screenX / 2 + x - ((w - width) / 2 / Z) + clipX),Math.floor(screenY / 2 + y - height / 2 / Z + clipY),w / Z - clipWidth / Z,h / Z - clipHeight / Z);
        this.layer.Draw.drawImage(this.buffer.Buffer,clipX,clipY,width - clipWidth,height - clipHeight,screenX / 2 + x + clipX,screenY / 2 + y + clipY,(width - clipWidth) / Z,height / Z - clipHeight);
    }
}