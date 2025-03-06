import { DrawFrame } from "../renderer/index.js";
import { FrameMain } from "./logic.js";
import { TickInit } from "./tick.js";

export const TicksInit = () => {
    FrameMain();
    TickInit();
}