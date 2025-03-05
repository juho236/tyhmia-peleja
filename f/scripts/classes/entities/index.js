import { screenX, screenY, unitScale } from "../../engine/info.js";
import { CreateBlankBuffer } from "../../engine/renderer/buffer/buffer.js";
import { GetCamera } from "../../game/camera/camera.js";
import { Vector2 } from "../position.js";


export class EntityBase {
    constructor(pos,size,z,layer) {
        this.pos = pos || new Vector2(0,0);
        this.size = size || new Vector2(0,0)
        this.rotation = 0;

        this.Z = z || 0;
        this.changed = true;
        this.layer = layer;
        this.preRender();
        this.prepareRender();
        layer.Items.insert(this);
    }
    pos;
    rotation;
    size;
    Z;
    changed = false;
    update() {
        this.changed = true;
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
    render(t,dt) {
        if (this.changed) { this.drawBase(t,dt); }
        this.changed = false;

        const cam = GetCamera();
        const pos = this.pos0.lerp(this.pos1,t);
        const Z = (cam.Z - this.Z) / 4;
        if (Z <= 0) { return; }
        //if (Math.abs(cam.X - pos.X))
        let x = pos.X - cam.X;
        let y = pos.Y - cam.Y;

        x -= this.size.X / 2;
        y -= this.size.Y / 2;

        x *= unitScale / Z;
        y *= unitScale / Z;
        let width = this.buffer.Buffer.width / Z;
        let height = this.buffer.Buffer.height / Z;

        this.layer.Draw.drawImage(this.buffer.Buffer,screenX / 2 + x,screenY / 2 + y,width,height);
    }
}
export class TextureEntityBase extends EntityBase {
    constructor(pos,size,z,layer,texture) {
        super(pos,size,z,layer);

        this.texture = texture;
        this.buffer = CreateBlankBuffer(size.X,size.Y);
    }

    drawBase(t,dt) {
        this.buffer.Buffer.width = this.size.X * unitScale;
        this.buffer.Buffer.height = this.size.Y * unitScale;

        this.buffer.Draw.clearRect(0,0,this.buffer.Buffer.width,this.buffer.Buffer.height);
        this.draw(t,dt);
    }
}