import { CreatureBase } from "../../classes/entities/creature.js";
import { Vector2 } from "../../classes/position.js";
import { screenY } from "../../engine/info.js";
import { Layers } from "../../engine/renderer/index.js";
import { GetEntities } from "../../engine/tick/tick.js";
import { GetCamera, TickCamera, UpdateCamera } from "../camera/camera.js";
import { BindToPress, BindToRelease, GetMouse } from "./input.js";

export const LoadEditor = async () => {
    spawnEditor();
}
const spawnEditor = () => {
    const editor = new CreatureBase(new Vector2(0,0),new Vector2(1,1),0,Layers.player,undefined,16,16);

    BindToPress("EditLeft",() => { editor.Left = true; });
    BindToRelease("EditLeft",() => { editor.Left = false; });
    BindToPress("EditRight",() => { editor.Right = true; });
    BindToRelease("EditRight",() => { editor.Right = false; });
    BindToPress("EditUp",() => { editor.Up = true; });
    BindToRelease("EditUp",() => { editor.Up = false; });
    BindToPress("EditDown",() => { editor.Down = true; });
    BindToRelease("EditDown",() => { editor.Down = false; });

    editor.Player = true;
    editor.physics = undefined;
    editor.AI = dt => {
        let speed = 8;
        if (editor.Left) {
            editor.pos.X -= speed * dt;
        } if (editor.Right) {
            editor.pos.X += speed * dt;
        } if (editor.Up) {
            editor.pos.Y -= speed * dt;
        } if (editor.Down) {
            editor.pos.Y += speed * dt;
        }

        let mouse = GetMouse();
        let entities = GetEntities();
        if (entities) { getEntity(entities,mouse.X,mouse.Y); }
        
        TickCamera(editor,dt);
    }
    editor.postRender = (t,dt) => {
        UpdateCamera(editor,t,dt);
    }

    editor.start();
}

const remove = p => {

}
const add = p => {
    console.log(p);
}

let previous;
const getEntity = (entities,x,y) => {
    let c = GetCamera();
    let target = undefined;
    let z = Infinity;
    entities.iterate(e => {
        if (e.Player) { return; }
        if (e.Z >= c.Z) { return; }

        const Z = c.Z - e.Z;
        if (Z > z) { return; }

        if (Math.abs(e.pos.X - c.X) - e.size.X / 2 > 0) { return; }
        if (Math.abs(e.pos.Y - c.Y) - e.size.Y / 2 + Math.abs(c.Y - screenY / 2) > 0) { return; }

        z = Z;
        target = e;
    });

    if (target != previous) {
        if (previous) { remove(previous); }
        previous = target;
        if (target) { add(target); }
    }
}