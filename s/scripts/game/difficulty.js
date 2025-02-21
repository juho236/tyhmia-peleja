import { Pause, Resume } from "../engine/frame.js";
import { Anchor, Color, Frame, Scale2, UILayer, Text, toSize } from "../engine/ui.js"
import { SetSaveKey } from "../lib/data.js";
import { table } from "../lib/table.js";
import { Layers } from "../renderer/render.js";
import { SetEnemyDifficulty } from "./enemies.js";
import { SetPlayerDifficulty } from "./player.js";
import { SetScoreDifficulty } from "./score.js";

const options = [
    {display: "Easy", desc: "Standard difficulty. XP drops are reduced and enemies move slower. Defense is less effective.", defensemultiplier: 1/3},
    {display: "Medium", desc: "The standard experience.", defensemultiplier: 0.5, healthmultiplier: 1.25, damagemultiplier: 1.5, hardattacks: true, xpmultiplier: 1.5},
    {display: "Hard", desc: "The intended experience. XP drops are increased and enemies move faster. Defense is more effective.", healthmultiplier: 1.333, damagemultiplier: 2, hardattacks: true, impossibleattacks: true, xpmultiplier: 2},
    {display: "Nightmare", desc: "Hard too easy for you?", healthmultiplier: 1, damagemultiplier: 3, hardattacks: true, impossibleattacks: true, nightmareattacks: true}
]
let ui;
export const Load = async (completed,savedata) => {
    ui = new UILayer(Layers.popup);

    new Promise(async completed => {
        if (savedata.difficulty != undefined) { completed(options[savedata.difficulty]); return; }
        let c = {};
        let canclick = true;
        let index = 0;
        table.iterate(options, (option,i) => {
            let f;
            f = new Frame(
                {
                    pos: new Scale2(0,0,0,index * 40), 
                    size: new Scale2(1,0,0,20), 
                    anchor: new Anchor(0,0), 
                    color: new Color(0,0,0,255),
                    onclick: () => {
                        if (!canclick) { return; }
                        canclick = false;
                        
                        SetSaveKey("difficulty",i);
                        completed(option);
                    },
                    onhover: () => {
                        f.color = new Color(0,0,0,192);
                        ui.redraw();
                    },
                    onleave: () => {
                        f.color = new Color(0,0,0,255);
                        ui.redraw();
                    }
                },{
                    title: new Text({text: option.display, size: new Scale2(0,100,1,0), textsize: 18}),
                    desc: new Text({text: option.desc, pos: new Scale2(0,100,0,0), size: new Scale2(1,-100,1,0), textsize: 10}),
                }
            );
            
            c[option.display] = f
            index ++;
        });


        Pause();
        ui.children = {
            bg: new Frame({pos: new Scale2(.5,0,.5,0), anchor: new Anchor(.5,.5), color: new Color(84,82,92,0)})
        }
        await toSize(ui,ui.children.bg,new Scale2(0,300,0,160),0.5);
        ui.children.bg.children = {
            title: new Text({pos: new Scale2(.5,0,0,0), size: new Scale2(2,0,0,48), anchor: new Anchor(.5,.5), text: "Choose difficulty", textsize: 22}),
            ...c
        }
    }).then(async d => {
        if (ui.children.bg) {
            ui.children.bg.children = {};
            await toSize(ui, ui.children.bg,new Scale2(0,0,0,0),0.5);
        }

        SetEnemyDifficulty(d);
        SetScoreDifficulty(d);
        await completed();
        SetPlayerDifficulty(d);

        Resume();
    });
}