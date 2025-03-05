import { CreatureBase } from "../../classes/entities/creature.js";
import { Vector2 } from "../../classes/position.js";
import { Layers } from "../../engine/renderer/index.js";
import { Textures } from "../../textures/textures.js";
import { BindToPress } from "./input.js";

export const LoadPlayer = async () => {
    spawnPlayer();
}


const spawnPlayer = () => {
    const player = new CreatureBase(new Vector2(0,1.125),new Vector2(0.75,0.75),0,Layers.player,Textures.Player.Temp,12,12);

    BindToPress("Left",() => { console.log("Left"); })
}