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
        for (let x=0;x<Math.abs(this.size.X) * unitScale;x+=this.tileX) {
            for (let y=0;y<Math.abs(this.size.Y) * unitScale;y+=this.tileY) {
                this.buffer.Draw.drawImage(this.texture,x,y,this.tileX,this.tileY);
            }
        }
    }
}

export class SliceEntity extends TextureEntityBase {
    constructor(pos,size,z,layer,texture,tileX,tileY,sliceLeft,sliceRight,sliceTop,sliceBottom,collision) {
        super(pos,size,z,layer,texture);

        this.sliceLeft = sliceLeft;
        this.sliceRight = sliceRight;
        this.sliceTop = sliceTop;
        this.sliceBottom = sliceBottom;
        this.tileX = tileX;
        this.tileY = tileY;

        this.collision = collision;
        this.start();
    }
    object = true;

    draw(t) {
        let width = this.tileX;
        let height = this.tileY;
        let w = this.buffer.Buffer.width;
        let h = this.buffer.Buffer.height;

        let sl = this.sliceLeft;
        let sr = this.sliceRight;
        let st = this.sliceTop;
        let sb = this.sliceBottom;
        this.buffer.Draw.drawImage(this.texture,0,0,sl,st,0,0,sl,st);
        this.buffer.Draw.drawImage(this.texture,width - sr,0,sr,st,w - sr,0,sr,st);
        this.buffer.Draw.drawImage(this.texture,0,height - sb,sl,sb,0,h - sb,sl,sb);
        this.buffer.Draw.drawImage(this.texture,width - sr,height - sb,sr,sb,w - sr,h - sb,sr,sb);

        let wtb = width - sl - sr;
        let htb = w - sl - sr;
        let otb = Math.ceil(htb / wtb) * wtb;
        let dtb = otb - htb;

        for (let x=0;x<htb;x+=wtb) {
            this.buffer.Draw.drawImage(this.texture,sl,0,wtb,st,sl + x - dtb / 2,0,wtb,st);
            this.buffer.Draw.drawImage(this.texture,sl,height - sb,wtb,sb,sl + x - dtb / 2,h - sb,wtb,sb);
        }
        
        let hlr = height - st - sb;
        let wlr = h - st - sb;
        let olr = Math.ceil(wlr / hlr) * hlr;
        let dlr = olr - wlr;

        for (let y=0;y<wlr;y+=hlr) {
            this.buffer.Draw.drawImage(this.texture,0,st,sl,hlr,0,st + y - dlr / 2,sl,hlr);
            this.buffer.Draw.drawImage(this.texture,width - sr,st,sr,hlr,w - sr,st + y - dlr / 2,sr,hlr);
        }

        for (let x=0;x<htb;x+=wtb) {
            for (let y=0;y<wlr;y+=hlr) {
                this.buffer.Draw.drawImage(this.texture,sl,st,wtb,hlr,sl + x - dtb / 2,st + y - dlr / 2,wtb,hlr);
            }
        }
    }
}