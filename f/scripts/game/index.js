import { TiledEntity } from "../classes/entities/tiles.js";
import { Vector2 } from "../classes/position.js";
import { Layers } from "../engine/renderer/index.js";
import { Textures } from "../textures/textures.js";
import { LoadEditor } from "./player/editor.js";
import { LoadPlayer } from "./player/player.js";

export const LoadGame = async textLoader => {
    new TiledEntity(new Vector2(0,2),new Vector2(33,1),0,Layers.env,Textures.World.Ground0,16,16,true);
    new TiledEntity(new Vector2(17,2),new Vector2(1,1),0,Layers.env,Textures.World.Ground0End,16,16);
    new TiledEntity(new Vector2(-17,2),new Vector2(-1,1),0,Layers.env,Textures.World.Ground0End,16,16);
    new TiledEntity(new Vector2(0,0),new Vector2(64,64),-1,Layers.background,Textures.World.Background0,16,16);
    
    new TiledEntity(new Vector2(0,6),new Vector2(64,8),-0.01,Layers.env,Textures.World.Black,16,16);
    new TiledEntity(new Vector2(23,-2),new Vector2(12,64),-0.01,Layers.env,Textures.World.Black,16,16);
    new TiledEntity(new Vector2(-23,-26),new Vector2(12,64),-0.01,Layers.env,Textures.World.Black,16,16);

    new TiledEntity(new Vector2(-17,-6),new Vector2(-1,16),0,Layers.env,Textures.World.Wall0,16,16,true);
    new TiledEntity(new Vector2(17,-6),new Vector2(1,16),0,Layers.env,Textures.World.Wall0,16,16,true);

    await LoadPlayer(textLoader);
}