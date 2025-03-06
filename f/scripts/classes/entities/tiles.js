import { unitScale } from "../../engine/info.js";
import { TextureEntityBase } from "./index.js";

export class TiledEntity extends TextureEntityBase {
    constructor(pos,size,z,layer,texture,tilex,tiley,collision) {
        super(pos,size,z,layer,texture);

        this.tileX = tilex;
        this.tileY = tiley;
        this.collision = collision;
        this.start();
    }
    object = true;

    draw(t,dt) {
        for (let x=0;x<this.size.X * unitScale;x+=this.tileX) {
            for (let y=0;y<this.size.Y * unitScale;y+=this.tileY) {
                this.buffer.Draw.drawImage(this.texture,x,y,this.tileX,this.tileY);
            }
        }
    }
}