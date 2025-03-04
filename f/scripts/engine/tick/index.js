import { DrawFrame } from "../renderer/index.js";
import { FrameMain } from "./logic.js";

export const TicksInit = () => {
    window.requestAnimationFrame(FrameMain);
}