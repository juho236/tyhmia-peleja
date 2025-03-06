import { Vector2 } from "../../classes/position.js";
import { GetScale } from "../../engine/renderer/window/window.js";

const actions = {
    Left: "arrowleft",
    Right: "arrowright",
    Jump: "z",
    EditLeft: "a",
    EditRight: "d",
    EditDown: "s",
    EditUp: "w",
}
let sheet = {};
const press = {};
const release = {};

export const BindToPress = (action,callback) => {
    press[action] = callback;
}
export const BindToRelease = (action,callback) => {
    release[action] = callback;
}

let mouseX = 0;
let mouseY = 0;

export const GetMouse = () => {
    const scale = GetScale();
    return new Vector2(mouseX / scale,mouseY / scale);
}
document.getElementById("game").onmousemove = e => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
}

const encode = () => {
    for (const action in actions) {
        sheet[actions[action]] = action;
    }
}

document.body.onkeydown = e => {
    const key = e.key.toLowerCase();

    const action = press[sheet[key]];
    if (!action) { return; }

    action();
}
document.body.onkeyup = e => {
    const key = e.key.toLowerCase();

    const action = release[sheet[key]];
    if (!action) { return; }

    action();
}

encode();