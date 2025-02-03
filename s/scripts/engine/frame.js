import { table } from "../lib/table.js";
import { ClearLayer, Layers } from "../renderer/render.js";

const callbacks = [];
const independent = [];

export const AddIndependent = callback => {
    table.insert(independent,callback);

    return callback;
}
export const RemoveIndependent = callback => {
    table.remove(independent,callback);
}

export const Add = (callback) => {
    table.insert(callbacks,callback);

    return callback;
}
export const Remove = (callback) => {
    table.remove(callbacks,callback);
}

let loaded = false;
let run = false;
window.onfocus = () => {
    if (!loaded) { return; }
    Load();
}
window.onblur = () => {
    if (!loaded) { return; } 
    Unload();
}

export const Load = () => {
    if (run) { return; }
    loaded = true;
    run = true;
    frame();
}
export const Unload = () => {
    run = false;
}

const time = () => {
    return (new Date()).getTime() / 1000;
}

const waitForFrame = async () => {
    await new Promise(completed => {
        window.requestAnimationFrame(completed);
    });
}

let frameRate = 30;
let frameTime = 0;

let lastTime = time();

const maxticks = 5;

let renderer;
export const setRenderer = r => {
    renderer = r;
}

let fspeed = 1;
export const Pause = () => {
    fspeed = 0;
}
export const Resume = () => {
    fspeed = 1;
}

let framecancel = false;
export const CancelFrame = () => {
    framecancel = true;
}

const frame = () => {
    if (!run) { return; }

    const t = time();
    const dt = Math.min(0.05,t - lastTime);
    lastTime = t;

    frameTime += dt * frameRate;
    let ticks = maxticks;
    while (frameTime >= 1) {
        if (ticks <= 0) { break; }
        frameTime -= 1;
        ticks -= 1;

        let startTime = time();
        ClearLayer(Layers.Projectiles);
        ClearLayer(Layers.Enemies);
        ClearLayer(Layers.Player);
        ClearLayer(Layers.XP);

        table.iterate(callbacks,callback => { if (!callback) { return; } callback(1 / frameRate * fspeed); if (framecancel) { framecancel = false; return -1; } });
        table.iterate(independent,callback => { if (!callback) { return; } callback(1 / frameRate); });

        try {
            renderer();
        } catch (err) {
            console.error(err);
            return;
        }

        let totalTime = time() - startTime;
    }

    window.requestAnimationFrame(frame);
}