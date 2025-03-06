import { TiledEntity } from "../classes/entities/tiles.js";
import { Vector2 } from "../classes/position.js";
import { Layers } from "../engine/renderer/index.js";
import { Textures } from "../textures/textures.js";
import { LoadEditor } from "./player/editor.js";

export const LoadGame = async textLoader => {
    new TiledEntity(new Vector2(0,2),new Vector2(5,1),0,Layers.env,Textures.World.Ground0,16,16,true);
    new TiledEntity(new Vector2(3,2),new Vector2(1,1),0,Layers.env,Textures.World.Ground0End,16,16,true);

    
    new TiledEntity(new Vector2(0,0),new Vector2(1,1),0,Layers.env,Textures.World.Ground0,16,16,true);

    new TiledEntity(new Vector2(3,-4),new Vector2(1,11),0,Layers.env,Textures.World.Wall0,16,16,true);

    new TiledEntity(new Vector2(0,-5),new Vector2(32,32),-1,Layers.background,Textures.World.Background0,16,16);
    
    new TiledEntity(new Vector2(0,5),new Vector2(64,5),0,Layers.env,Textures.World.Black,16,16);
    new TiledEntity(new Vector2(9,0),new Vector2(11,64),0,Layers.env,Textures.World.Black,16,16);

    await LoadEditor(textLoader);
}