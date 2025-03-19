import { StepPhysics } from "../../engine/physics/physics.js";
import { TextureEntityBase } from "./index.js";

export class CreatureBase extends TextureEntityBase {
    constructor(pos,size,z,layer,texture,tw,th) {
        super(pos,size,z,layer,texture);

        this.textureX = tw;
        this.textureY = th;
    }
    changeTexture(texture,tw,th) {
        this.texture = texture;
        this.textureX = tw;
        this.textureY = th;
    }
    
    draw(t,dt) {
        if (!this.texture) { return; }
        this.buffer.Draw.drawImage(this.texture,0,0);
    }
    onground = -1;
    gravity = 40;

    setvelocity(x,y,t) {
        this.knockbackX = x;
        this.velocity.Y = y;
        this.knockbackTimer = t;
    }
    physics(dt) {
        StepPhysics(this,dt);
    }
}