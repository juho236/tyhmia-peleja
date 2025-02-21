import { Pause, Resume, SetFramerate } from "../engine/frame.js"
import { Anchor, Color, Frame, Scale2, Text, UILayer, toSize } from "../engine/ui.js";
import { NewGame } from "../lib/data.js";
import { Layers } from "../renderer/render.js";

let ui;
let paused = false;
let canpause = true;
let animation = false;
export const PauseGame = async () => {
    if (animation) { return; }
    if (paused) { ResumeGame(); return; }
    if (!canpause) { CloseSettings(); } else {
        ui.children = {
            bg: new Frame({pos: new Scale2(.5,0,.5,0), anchor: new Anchor(.5,.5), color: new Color(84,82,92,0)})
        }
    }
    paused = true;
    animation = true;
    Pause();

    

    let bg = ui.children.bg;
    await toSize(ui,bg,new Scale2(0,110,0,68),0.4);
    bg.children = {
        title: new Text({size: new Scale2(1,0,0,16), anchor: new Anchor(0,1), textsize: 16, text: "Game Paused"}),
        resume: new Frame({size: new Scale2(1,-4,0,20), pos: new Scale2(0,2,0,2), color: new Color(0,0,0,255),
            onhover: f => {
                f.color = new Color(0,0,0,192);
                ui.redraw();
            }, onleave: f => {
                f.color = new Color(0,0,0,255);
                ui.redraw();
            }, onclick: ResumeGame
        },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "Resume"})}),
        settings: new Frame({size: new Scale2(1,-4,0,20), pos: new Scale2(0,2,0,24), color: new Color(0,0,0,255),
            onhover: f => {
                f.color = new Color(0,0,0,192);
                ui.redraw();
            }, onleave: f => {
                f.color = new Color(0,0,0,255);
                ui.redraw();
            }, onclick: OpenSettings
        },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "Settings"})}),
        newgame: new Frame({size: new Scale2(1,-4,0,20), pos: new Scale2(0,2,0,46), color: new Color(0,0,0,255),
            onhover: f => {
                f.color = new Color(0,0,0,192);
                ui.redraw();
            }, onleave: f => {
                f.color = new Color(0,0,0,255);
                ui.redraw();
            }, onclick: NewGame
        },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "New game"})}),
    }
    animation = false;
    ui.redraw();
}
const ResumeGame = async () => {
    paused = false;
    animation = true;

    let bg = ui.children.bg;
    bg.children = {};
    await toSize(ui,bg,new Scale2(0,0,0,0),0.4);

    ui.children = {};
    ui.redraw();
    
    animation = false;
    Resume();
}
export const OpenSettings = async () => {
    if (animation) { return; }
    animation = true;
    canpause = false;
    paused = false;

    let bg = ui.children.bg;
    bg.children = {};
    await toSize(ui,bg,new Scale2(0,300,0,200),0.5);

    bg.children = {
        fps: new Frame({size: new Scale2(1,-4,0,20), pos: new Scale2(0,2,0,2), color: new Color(0,0,0,255)},{
            title: new Text({size: new Scale2(0,100,1,0), textsize: 16, text: "Framerate:"}),
            options: new Frame({size: new Scale2(1,-98,1,0), pos: new Scale2(0,100,0,0), color: new Color(0,0,0,255)},{
                f30: new Frame({size: new Scale2(0.2,-2,1,0), color: new Color(0,0,0,200),
                    onhover: f => {
                        f.color = new Color(0,0,0,150);
                        ui.redraw();
                    }, onleave: f => {
                        f.color = new Color(0,0,0,200);
                        ui.redraw();
                    }, onclick: () => { SetFramerate(30); }
                },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "30"})}),
                f60: new Frame({size: new Scale2(0.2,-2,1,0), pos: new Scale2(0.2,0,0,0), color: new Color(0,0,0,200),
                    onhover: f => {
                        f.color = new Color(0,0,0,150);
                        ui.redraw();
                    }, onleave: f => {
                        f.color = new Color(0,0,0,200);
                        ui.redraw();
                    }, onclick: () => { SetFramerate(60); }
                },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "60"})}),
                f120: new Frame({size: new Scale2(0.2,-2,1,0), pos: new Scale2(0.4,0,0,0), color: new Color(0,0,0,200),
                    onhover: f => {
                        f.color = new Color(0,0,0,150);
                        ui.redraw();
                    }, onleave: f => {
                        f.color = new Color(0,0,0,200);
                        ui.redraw();
                    }, onclick: () => { SetFramerate(120); }
                },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "120"})}),
                f144: new Frame({size: new Scale2(0.2,-2,1,0), pos: new Scale2(0.6,0,0,0), color: new Color(0,0,0,200),
                    onhover: f => {
                        f.color = new Color(0,0,0,150);
                        ui.redraw();
                    }, onleave: f => {
                        f.color = new Color(0,0,0,200);
                        ui.redraw();
                    }, onclick: () => { SetFramerate(144); }
                },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "144"})}),
                f240: new Frame({size: new Scale2(0.2,-2,1,0), pos: new Scale2(0.8,0,0,0), color: new Color(0,0,0,200),
                    onhover: f => {
                        f.color = new Color(0,0,0,150);
                        ui.redraw();
                    }, onleave: f => {
                        f.color = new Color(0,0,0,200);
                        ui.redraw();
                    }, onclick: () => { SetFramerate(240); }
                },{text: new Text({size: new Scale2(1,0,1,0), textsize: 16, text: "240"})}),
            })
        })
    }

    animation = false;
}
export const CloseSettings = async () => {
    let bg = ui.children.bg;
    bg.children = {};
    canpause = true;
}


export const Load = async () => {
    ui = new UILayer(Layers.pause);
}