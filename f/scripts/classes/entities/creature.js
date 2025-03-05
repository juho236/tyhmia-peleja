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
        this.buffer.Buffer.width = this.textureX;
        this.buffer.Buffer.height = this.textureY;
        this.buffer.Draw.drawImage(this.texture,0,0);
    }
}