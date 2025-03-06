import { Vector2 } from "../../classes/position.js";

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
    return new Vector2(mouseX,mouseY);
}
document.body.onmousemove = e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
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