import { Add as AddTick, Remove, Remove as RemoveTick, setRenderer } from "../engine/frame.js";
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
    Player: BlankBuffer(width,height),
    scores: BlankBuffer(width,height),
    hud: BlankBuffer(width,height),
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

let shake = 0;

export const Shake = (strength,fade) => {
    shake += strength;

    let s = strength;
    let t = AddTick(dt => {
        let d = dt / fade * s;
        if (d >= strength) { shake -= strength; Remove(t); return; }
        
        shake -= d;
        strength -= d;
    });
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
    draw.drawImage(Layers.scores.Buffer,0,0);
    draw.drawImage(Layers.hud.Buffer,0,0);

    bufferIndex ++;
    if (bufferIndex >= buffers) { bufferIndex = 0; }
    d.clearRect(0,0,width,height);

    let s = Math.sqrt(Math.max(0,shake));
    d.drawImage(tripleBuffer[bufferIndex].Buffer,(Math.random() * 2 - 1) * s,(Math.random() * 2 - 1) * s);
}