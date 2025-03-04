import { Table } from "../../classes/table.js";
import { screenX, screenY, unitScale } from "../info.js"
import { CreateBlankBuffer } from "./buffer/buffer.js";
import { RenderLayered } from "./render.js";
import { AdjustWindow, ClearMain, DrawToMain } from "./window/window.js"

export const Layers = {
    background: 0,
    env: 1,
    entity: 2,
    player: 3,
    foreground: 4,
    ui: 5
}
const layerOrder = [];

Object.entries(Layers).map(v => {
    const key = v[0];
    const order = v[1];

    layerOrder[order] = key;

    const b = CreateBlankBuffer(screenX,screenY);

    b.Items = new Table();

    Layers[key] = b;
})

export const DrawFrame = (t,dt) => {

    ClearMain();
    layerOrder.map(k => {
        RenderLayered(Layers[k].Items,item => {
            item.render(t,dt);
        });
        DrawToMain(Layers[k]);
    });
}

AdjustWindow();