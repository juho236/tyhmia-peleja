import { Layers, width, height } from "../renderer/render.js";
import { Add as AddTick } from "../engine/frame.js";
import { LoadTexture, TextureBuffer } from "../lib/texture.js";
import { v2 } from "../lib/classes.js";
import { table } from "../lib/table.js";

export const Load = async () => {
    const starTexture = await TextureBuffer(await LoadTexture("assets/star.png"),3,3);

    createStars(starTexture);

    AddTick(main);
}

let speed = 200;
export const SetSpeed = v => {
    speed = v;
}

let stars = [];
class Star {
    constructor(texture,position,scale) {
        this.position = position;
        this.scale = scale;

        this.buffer = texture;
    }
    relocate() {
        this.position.y = -2;
        this.position.x = Math.random() * width;
        this.lastpos = this.position;
    }

    frame(dt) {
        let scale = this.scale;
        this.position = this.position.add(new v2((this.position.x - width) / width * dt * speed * scale / 64,speed * dt * scale / 4));

        if (this.position.x > -4 && this.position.x < width + 4 && this.position.y < height + 4) { return; }

        this.relocate();
    }
    render(draw) {
        if (this.lastpos) {
            let p = this.lastpos.sub(this.position).divide(1.5);

            draw.globalAlpha = 0.45;
            draw.drawImage(this.buffer.Buffer,this.position.x + p.x,this.position.y + p.y);
            draw.drawImage(this.buffer.Buffer,this.position.x - p.x,this.position.y - p.y);
            draw.globalAlpha = 0.45;
        }
        this.lastpos = this.position;
        draw.drawImage(this.buffer.Buffer,this.position.x,this.position.y);
    }
}
const createStars = texture => {
    for (let i=0; i < 16; i ++) {
        let star = new Star(texture,new v2(Math.random() * width,Math.random() * height),1 + Math.random() / 10);

        table.insert(stars,star);
    }
    for (let i=0; i < 16; i ++) {
        let star = new Star(texture,new v2(Math.random() * width,Math.random() * height),0.5 + Math.random() / 15);

        table.insert(stars,star);
    }
    for (let i=0; i < 16; i ++) {
        let star = new Star(texture,new v2(Math.random() * width,Math.random() * height),0.4 + Math.random() / 20);

        table.insert(stars,star);
    }
    for (let i=0; i < 16; i ++) {
        let star = new Star(texture,new v2(Math.random() * width,Math.random() * height),0.2 + Math.random() / 25);

        table.insert(stars,star);
    }
}
const main = dt => {
    const draw = Layers.Stars.Draw;

    draw.clearRect(0,0,width,height);
    stars.map(star => {
        if (!star) { return; }

        star.frame(dt);
        star.render(draw);
    })
}