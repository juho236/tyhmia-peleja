import { Vector2, Vector3 } from "../../classes/position.js";

let camX = 0;
let camY = 0;
let camZ = 2;

export const GetCamera = () => {
    return new Vector3(camX,camY,camZ);
}

let x0 = 0;
let x1 = 0;
let y0 = 0;
let y1 = 0;

export const TickCamera = (player,dt) => {
    x0 = x1;
    y0 = y1;

    x1 = x1 + (player.pos.X - x1) * dt * 4;
    y1 = y1 + (player.pos.Y - y1 - 1) * dt * 4;
}
export const UpdateCamera = (player,t,dt) => {
    camX = x0 + (x1 - x0) * t;
    camY = y0 + (y1 - y0) * t;
}