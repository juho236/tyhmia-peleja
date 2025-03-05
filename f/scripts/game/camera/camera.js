import { Vector2, Vector3 } from "../../classes/position.js";

let camX = 0;
let camY = 0;
let camZ = 2;

export const GetCamera = () => {
    return new Vector3(camX,camY,camZ);
}