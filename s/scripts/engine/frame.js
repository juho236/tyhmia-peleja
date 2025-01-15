import { table } from "../lib/table.js";

const callbacks = [];

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

let frameRate = 30;
let frameTime = 0;

let lastTime = time();

const maxticks = 4;
const frame = () => {
    if (!run) { return; }

    const t = time();
    const dt = t - lastTime;
    lastTime = t;

    frameTime += dt * frameRate;
    let ticks = maxticks;
    while (frameTime >= 1) {
        if (ticks <= 0) { break; }
        frameTime -= 1;
        ticks -= 1;

        callbacks.map(callback => { if (!callback) { return; } callback(1 / frameRate); });
    }

    window.requestAnimationFrame(frame);
}