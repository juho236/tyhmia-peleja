import { CreatureBase } from "../../classes/entities/creature.js";
import { SliceEntity } from "../../classes/entities/tiles.js";
import { Scale2, Vector2 } from "../../classes/position.js";
import { UIFrame, UIImage } from "../../classes/ui/elements.js";
import { Color3, Sizes, UILayer } from "../../classes/ui/index.js";
import { screenX, screenY, unitScale } from "../../engine/info.js";
import { Layers } from "../../engine/renderer/index.js";
import { GetEntities } from "../../engine/tick/tick.js";
import { Textures } from "../../textures/textures.js";
import { GetCamera, TickCamera, UpdateCamera } from "../camera/camera.js";
import { BindToPress, BindToRelease, GetMouse } from "./input.js";

export const LoadEditor = async () => {
    spawnEditor();
}

let overlaytarget;
let selection;
let uilayer;
let arrowContainer;
let arrows;
const spawnEditor = () => {
    const editor = new CreatureBase(new Vector2(0,0),new Vector2(1,1),0,Layers.player,undefined,16,16);
    selection = new SliceEntity(undefined,new Vector2(1,1),0,Layers.ui,Textures.Editor.Select,16,16,5,5,5,5);
    selection.visible = false;

    BindToPress("EditLeft",() => { editor.Left = true; });
    BindToRelease("EditLeft",() => { editor.Left = false; });
    BindToPress("EditRight",() => { editor.Right = true; });
    BindToRelease("EditRight",() => { editor.Right = false; });
    BindToPress("EditUp",() => { editor.Up = true; });
    BindToRelease("EditUp",() => { editor.Up = false; });
    BindToPress("EditDown",() => { editor.Down = true; });
    BindToRelease("EditDown",() => { editor.Down = false; });
    BindToRelease("Click",() => {
        overlay();
    });

    uilayer = new UILayer(Layers.ui,1);
    uilayer.enabled = false;
    arrows = [new UIImage(new Scale2(0.5,0,0,16),new Scale2(0,16,0,16),new Vector2(0.5,0),Textures.Editor.Move)];
    arrowContainer = new UIFrame(undefined,Sizes.Fullscreen,undefined,undefined);

    arrowContainer.addChild(arrows[0]);
    uilayer.addChild(arrowContainer);

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
        let cam = GetCamera();
        let entities = GetEntities();
        if (entities) { getEntity(entities,mouse.X,mouse.Y); }

        if (overlaytarget) {
            const Z = (cam.Z - overlaytarget.Z) / 4;
            let rpos = overlaytarget.pos.sub(new Vector2(cam.X,cam.Y)).multiply(1 / Z);
            arrows[0].pos = new Scale2(0,screenX / 2 + rpos.X * unitScale,0,Math.min(Math.max(screenY / 2 + rpos.Y * unitScale - overlaytarget.size.Y / 2 * unitScale - 16,0),screenY - 16));
            uilayer.changed = true;
        }
        

        TickCamera(editor,dt);
    }
    editor.postRender = (t,dt) => {
        UpdateCamera(editor,t,dt);
    }

    editor.start();
}

let hovertarget;
const remove = p => {
    hovertarget = undefined;
}
const add = p => {
    hovertarget = p;
}

const overlay = () => {
    if (overlaytarget) {
        selection.visible = false;
        uilayer.enabled = false;
    }
    overlaytarget = hovertarget;
    if (!overlaytarget) { return; }

    selection.size = overlaytarget.size;
    selection.pos = overlaytarget.pos;
    selection.Z = overlaytarget.Z;
    selection.changed = true;
    selection.visible = true;
    arrowContainer.visible = true;
    uilayer.enabled = true;
}

let previous;
const getEntity = (entities,x,y) => {
    let c = GetCamera();
    let target = undefined;
    let z = Infinity;

    x = (x - screenX / 2) / unitScale;
    y = (y - screenY / 2) / unitScale;

    entities.iterate(e => {
        if (e.Player) { return; }
        if (e.Z >= c.Z) { return; }

        const Z = (c.Z - e.Z);
        if (Z > z) { return; }

        if (Math.abs(e.pos.X - (c.X + x / Z)) - e.size.X / 2 > 0) { return; }
        if (Math.abs(e.pos.Y - (c.Y + y / Z)) - e.size.Y / 2 > 0) { return; }

        z = Z;
        target = e;
    });

    if (target != previous) {
        if (previous) { remove(previous); }
        previous = target;
        if (target) { add(target); }
    }
}