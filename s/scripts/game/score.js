import { Add, Remove } from "../engine/frame.js";
import { Anchor, Color, Scale2, Text, UILayer } from "../engine/ui.js";
import { Layers } from "../renderer/render.js";

let score = 0;
let savedScore = 0;

let ui;
export const AddScore = (sc,x,y) => {
    score += sc;
    if (!ui) { return; }

    let t = new Text({text: sc.toString(), textsize: 20, pos: new Scale2(0,x,0,y), size: new Scale2(0,0,0,0), anchor: new Anchor(0,0), color: new Color(255,255,255,0)})
    ui.addChild(t);
    ui.redraw();
    
    let lifetime = 1;
    let e;
    e = Add(dt => {
        lifetime -= dt;
        if (lifetime <= 0) { Remove(e); t.destroy(); }

        t.pos = t.pos.add(new Scale2(0,0,0,-dt * 50));
        ui.redraw();
    });
}
export const GetScore = () => {
    return score;
}
export const SaveScore = () => {
    savedScore = score;
}
export const LoadScore = () => {
    score = savedScore;

    ui = new UILayer(Layers.scores);
}