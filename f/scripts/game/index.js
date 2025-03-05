import { TiledEntity } from "../classes/entities/tiles.js";
import { Vector2 } from "../classes/position.js";
import { Layers } from "../engine/renderer/index.js";
import { Textures } from "../textures/textures.js";
import { LoadPlayer } from "./player/player.js";

export const LoadGame = async textLoader => {
    new TiledEntity(new Vector2(0,2),new Vector2(64,1),0,Layers.env,Textures.World.Ground0,16,16);
    new TiledEntity(new Vector2(0,-5),new Vector2(128,16),-1,Layers.background,Textures.World.Background0,16,16);

    await LoadPlayer(textLoader);
}