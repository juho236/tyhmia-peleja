const getName = (event) => {
    return event.key.toLowerCase();
}

const keyDown = {};
const keyUp = {};

document.onkeydown = (event) => {
    const name = getName(event);
    if (keyDown[name]) { keyDown[name](); }
}
document.onkeyup = (event) => {
    const name = getName(event);
    if (keyUp[name]) { keyUp[name](); }
}


export const BindToKeyDown = (key, callback) => {
    keyDown[key] = callback;
}
export const BindToKeyUp = (key, callback) => {
    keyUp[key] = callback;
}