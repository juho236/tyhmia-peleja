import { TickRate } from "../info.js";
import { DrawFrame } from "../renderer/index.js";
import { GetTime } from "../time.js";
import { TickMain } from "./tick.js";

let lastTime = 0;
let frameTime = 0;

export const FrameMain = () => {
    let t = GetTime();
    let dt = t - lastTime;
    lastTime = t;

    dt = Math.min(0.05,dt);

    frameTime += dt * TickRate;
    if (frameTime >= 1) {
        frameTime -= 1;
        
        TickMain(1 / TickRate);
    }

    DrawFrame(frameTime,dt);

    window.requestAnimationFrame(FrameMain);
}