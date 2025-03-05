const actions = {
    Left: "arrowleft"
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