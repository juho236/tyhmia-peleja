import { Vector2 } from "../position.js";
import { UIBase } from "./index.js";

export class UIFrame extends UIBase {
    constructor(pos,size,anchor,color) {
        super(pos,size,anchor,color);
    }

    render(x,y,w,h) {
        const draw = this.parent.buffer.Draw;

        draw.fillStyle = this.color.hex;
        draw.fillRect(x,y,w,h);
    }
}

export class UIText extends UIBase {
    constructor(pos,size,anchor,color,text,font,fontsize) {
        super(pos,size,anchor,color);

        this.text = text;
        this.font = font;
        this.fontsize = fontsize || 1;

        this.textanchor = new Vector2(0.5,0.5);
    }
    text;
    font;
    fontsize;
    set text(n) {
        this.updateparent();
    }
    set font(n) {
        this.updateparent();
    }
    set fontsize(n) {
        this.updateparent();
    }

    calculateSize() {
        let data = this.font.data;
        let l = this.text.length;
        let size = 0;
        let height = data.Meta.scaleY * this.fontsize;
        for (let i = 0;i<l;i++) {
            let char = this.text.charAt(i);

            let cdata = data.Characters[char];
            if (!cdata) { size += data.Meta.scaleX * this.fontsize; continue; }
            let offsetX = cdata.offsetX || 0;
            let offsetY = cdata.offsetY || 0;

            size += (data.Meta.scaleX - offsetX) * this.fontsize;
        }

        return new Vector2(size,height);
    }

    render(x,y,w,h) {
        const draw = this.parent.buffer.Draw;

        let data = this.font.data;
        const tileX = data.Meta.scaleX;
        const tileY = data.Meta.scaleY;
        let size = this.calculateSize();

        x += this.textanchor.X * w - this.textanchor.X * size.X;
        y += this.textanchor.Y * h - this.textanchor.Y * size.Y;

        let l = this.text.length;
        let pos = new Vector2(x,y);
        for (let i = 0;i<l;i++) {
            let char = this.text.charAt(i);

            let cdata = data.Characters[char];
            if (!cdata) { pos = pos.add(new Vector2(tileX * this.fontsize,0)); continue; }
            
            let offsetX = cdata.offsetX || 0;
            let offsetY = cdata.offsetY || 0;

            let w = (tileX - offsetX) * this.fontsize;
            let h = tileY * this.fontsize;
            draw.drawImage(this.font.image,cdata.tileX * tileX,cdata.tileY * tileY,tileX,tileY,pos.X,pos.Y + offsetY * this.fontsize,tileX * this.fontsize,tileY * this.fontsize);
            pos = pos.add(new Vector2(Math.floor(w),0));
        }
    }
}