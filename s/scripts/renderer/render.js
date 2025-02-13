import { Add as AddTick, Remove, Remove as RemoveTick, setRenderer } from "../engine/frame.js";
import { v2 } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { BlankBuffer } from "../lib/texture.js";
import { Load as LoadUI } from "../engine/ui.js";

export const width = 384;
export const height = 256;

let x = 0, y = 0;
let sx = 0, sy = 0;
let currentscale = 1;
export const GetMouse = () => {
    return new v2(sx,sy);
}

let mouseEvents = [];

export const AddMouseEvent = event => {
    table.insert(mouseEvents,event);
}
export const Load = (canvas, draw) => {
    draw.imageSmoothingEnabled = false;
    setRenderer(dt => {main(canvas,draw);});

    canvas.onmousemove = event => {
        x = event.offsetX;
        y = event.offsetY;
        table.iterate(mouseEvents, event => { event(x / currentscale,y / currentscale); })
    }
    LoadUI(canvas);
}
export const Layers = {
    Stars: BlankBuffer(width,height),
    Projectiles: BlankBuffer(width,height),
    Enemies: BlankBuffer(width,height),
    Player: BlankBuffer(width,height),
    XP: BlankBuffer(width,height),
    hud: BlankBuffer(width,height),
    shop: BlankBuffer(width,height),
    popup: BlankBuffer(width,height),
    pause: BlankBuffer(width,height),
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
let shakex = 0;
let shakey = 0;

export const GetShake = () => {
    return new v2(shakex,shakey);
}
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
    currentscale = scale;
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
    draw.drawImage(Layers.XP.Buffer,0,0);
    draw.drawImage(Layers.hud.Buffer,0,0);
    draw.drawImage(Layers.shop.Buffer,0,0);
    draw.drawImage(Layers.popup.Buffer,0,0);
    draw.drawImage(Layers.pause.Buffer,0,0);

    bufferIndex ++;
    if (bufferIndex >= buffers) { bufferIndex = 0; }
    d.clearRect(0,0,width,height);

    let s = Math.sqrt(Math.max(0,shake));

    shakex = (Math.random() * 2 - 1) * s;
    shakey = (Math.random() * 2 - 1) * s;
    d.drawImage(tripleBuffer[bufferIndex].Buffer,0,0);
}