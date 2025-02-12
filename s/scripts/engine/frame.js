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
export const CancelFrame = (c) => {
    framecancel = c;
}

let fpstime = 0;
let fps = 0;

let fpsCallback = () => {};
export const SetFPSCallback = c => { fpsCallback = c; }
const frame = async () => {
    if (!run) { return; }

    if (framecancel) { await framecancel(); framecancel = false; window.requestAnimationFrame(frame); return; }

    const t = time();
    const dt = Math.min(0.05,t - lastTime);

    frameTime += dt * frameRate;
    let ticks = maxticks;

    fpstime += t - lastTime;
    lastTime = t;
    if (fpstime >= 1) {
        fpstime -= 1;
        fpsCallback(fps);
        fps = 0;
    }
    while (frameTime >= 1) {
        if (ticks <= 0) { break; }
        frameTime -= 1;
        ticks -= 1;
        fps ++;

        let startTime = time();
        ClearLayer(Layers.Projectiles);
        ClearLayer(Layers.Enemies);
        ClearLayer(Layers.Player);
        ClearLayer(Layers.XP);

        table.iterate(callbacks,callback => { if (!callback) { return; } callback(1 / frameRate * fspeed); });
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