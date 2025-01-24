import { Add as AddTick, setRenderer } from "../engine/frame.js";
import { v2 } from "../lib/classes.js";
import { BlankBuffer } from "../lib/texture.js";

export const width = 384;
export const height = 256;

let x = 0, y = 0;
let sx = 0, sy = 0;
export const GetMouse = () => {
    return new v2(sx,sy);
}

export const Load = (canvas, draw) => {
    setRenderer(dt => {main(canvas,draw);});

    canvas.onmousemove = event => {
        x = event.offsetX;
        y = event.offsetY;
    }
}
export const Layers = {
    Stars: BlankBuffer(width,height),
    Projectiles: BlankBuffer(width,height),
    Enemies: BlankBuffer(width,height),
    Player: BlankBuffer(width,height)
}

export const ClearLayer = layer => {
    layer.Draw.clearRect(0,0,width,height);
}

const tripleBuffer = [];
let bufferIndex = 0;
const buffers = 2;

for (let i=0;i<buffers;i++) {
    tripleBuffer[i] = BlankBuffer(width,height);
}

const main = (canvas, d) => {
    const scale = Math.min(document.body.offsetWidth / width, document.body.offsetHeight / height);
    sx = x / scale;
    sy = y / scale;

    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;

    const draw = tripleBuffer[bufferIndex].Draw;

    draw.clearRect(0,0,width,height);
    draw.drawImage(Layers.Stars.Buffer,0,0);
    draw.drawImage(Layers.Enemies.Buffer,0,0);
    draw.drawImage(Layers.Projectiles.Buffer,0,0);
    draw.drawImage(Layers.Player.Buffer,0,0);

    bufferIndex ++;
    if (bufferIndex >= buffers) { bufferIndex = 0; }
    d.clearRect(0,0,width,height);
    d.drawImage(tripleBuffer[bufferIndex].Buffer,0,0);
}