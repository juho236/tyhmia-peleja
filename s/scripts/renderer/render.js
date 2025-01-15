import { Add as AddTick } from "../engine/frame.js";
import { BlankBuffer } from "../lib/texture.js";

export const width = 384;
export const height = 256;

export const Load = (canvas, draw) => {
    AddTick(dt => {main(canvas,draw);});
}
export const Layers = {
    Stars: BlankBuffer(width,height)
}


const main = (canvas, draw) => {
    const scale = Math.min(document.body.offsetWidth / width, document.body.offsetHeight / height);

    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;

    draw.clearRect(0,0,width,height);
    draw.drawImage(Layers.Stars.Buffer,0,0);
}