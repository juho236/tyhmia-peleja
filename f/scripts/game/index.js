import { TiledEntity } from "../classes/entities/tiles.js";
import { Vector2 } from "../classes/position.js";
import { Layers } from "../engine/renderer/index.js";
import { Textures } from "../textures/textures.js";
import { LoadEditor } from "./player/editor.js";

export const LoadGame = async textLoader => {
    new TiledEntity(new Vector2(0,0),new Vector2(1,1),0,Layers.env,Textures.World.Ground0,16,16,true);

    await LoadEditor(textLoader);
}