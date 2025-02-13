import { Pause, Resume } from "../engine/frame.js"
import { Anchor, Color, Frame, Scale2, Text, UILayer, toSize } from "../engine/ui.js";
import { Layers } from "../renderer/render.js";

let ui;
let paused = false;
let canpause = true;
let animation = false;
export const PauseGame = async () => {
    if (animation) { return; }
    if (!canpause) { return; }
    if (paused) { ResumeGame(); return; }
    paused = true;
    animation = true;
    Pause();

    ui.children = {
        bg: new Frame({pos: new Scale2(.5,0,.5,0), anchor: new Anchor(.5,.5), color: new Color(84,82,92,0)})
    }

    let bg = ui.children.bg;
    await toSize(ui,bg,new Scale2(0,200,0,100),0.5);
    bg.children = {
        title: new Text({size: new Scale2(1,0,0,16), anchor: new Anchor(0,1), textsize: 16, text: "Game Paused"})
    }
    animation = false;
    ui.redraw();
}
const ResumeGame = async () => {
    paused = false;
    animation = true;

    let bg = ui.children.bg;
    bg.children = {};
    await toSize(ui,bg,new Scale2(0,0,0,0),0.5);

    ui.children = {};
    ui.redraw();
    
    animation = false;
    Resume();
}

export const Load = async () => {
    ui = new UILayer(Layers.pause);
}