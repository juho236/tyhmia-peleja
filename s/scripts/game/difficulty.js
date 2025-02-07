import { Pause, Resume } from "../engine/frame.js";
import { Anchor, Color, Frame, Scale2, UILayer, Text } from "../engine/ui.js"
import { table } from "../lib/table.js";
import { Layers } from "../renderer/render.js";
import { SetEnemyDifficulty } from "./enemies.js";
import { SetPlayerDifficulty } from "./player.js";
import { SetScoreDifficulty } from "./score.js";

const options = [
    {display: "Easy"},
    {display: "Medium", healthmultiplier: 1.25, damagemultiplier: 2, hardattacks: true, xpmultiplier: 0.5},
    {display: "Hard", healthmultiplier: 1.333, damagemultiplier: 3, hardattacks: true, impossibleattacks: true, xpmultiplier: 1}
]
let ui;
export const Load = async completed => {
    ui = new UILayer(Layers.popup);

    new Promise(completed => {
        let c = {};
        let canclick = true;
        let index = 0;
        table.iterate(options, option => {
            let f;
            f = new Frame(
                {
                    pos: new Scale2(0,0,0,index * 20), 
                    size: new Scale2(1,0,0,20), 
                    anchor: new Anchor(0,0), 
                    color: new Color(0,0,0,255),
                    onclick: () => {
                        if (!canclick) { return; }
                        canclick = false;
                        
                        
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
                    title: new Text({text: option.display, size: new Scale2(1,0,0,0), textsize: 18}),
                }
            );
            
            c[option.display] = f
            index ++;
        });


        ui.children = {
            bg: new Frame({size: new Scale2(0,150,0,60), pos: new Scale2(.5,0,.5,0), anchor: new Anchor(.5,.5), color: new Color(84,82,92,0)},{
                title: new Text({pos: new Scale2(.5,0,0,0), size: new Scale2(1,0,0,48), anchor: new Anchor(.5,.5), text: "Choose difficulty", textsize: 22}),
                ...c
            })
        }
        ui.redraw();
        Pause();
    }).then(async d => {
        ui.children = {};
        ui.redraw();

        SetEnemyDifficulty(d);
        SetScoreDifficulty(d);
        await completed();
        SetPlayerDifficulty(d);

        Resume();
    });
}