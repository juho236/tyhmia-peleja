import { Table } from "../../classes/table.js";

let ticks;

export const TickMain = dt => {
    if (!ticks) { return; }
    ticks.iterate(entity => {
        if (entity.preRender) { entity.preRender(); }
        if (entity.AI) { entity.AI(dt); }
        if (entity.logic) { entity.logic(dt); }
        if (entity.prepareRender) { entity.prepareRender(); }
    });
}
export const FrameMain = (t,dt) => {

}

export const GetEntities = () => { return ticks; }
export const TickInit = () => {
    ticks = new Table();
}

export const AddEntity = entity => {
    ticks.insert(entity);
}