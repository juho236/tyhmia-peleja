import { Layers, width, height } from "../renderer/render.js";
import { Add as AddTick } from "../engine/frame.js";
import { LoadTexture, LoadTextures, TextureBuffer, TextureBuffers } from "../lib/texture.js";
import { v2, entity, trailParticleEmitter } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { SetSpeed } from "./background.js";
import { BindToKeyDown, BindToKeyUp } from "../engine/input.js";

export const Load = async () => {
    SetSpeed(0);
    const playerEntity = new entity("Player",new v2(16,16),Layers.Player,await TextureBuffers(await LoadTextures(
        {
            forward: "assets/ship-forward.png"
        }
    ),16,16));

    const trailTextures = await TextureBuffers(await LoadTextures(
        {
            full0: "assets/trail-full0.png",
            full1: "assets/trail-full1.png",
            full2: "assets/trail-full2.png",
            full3: "assets/trail-full3.png",
            smoke0: "assets/trail-smoke0.png",
            smoke1: "assets/trail-smoke1.png",
        }
    ),5,5)
    new trailParticleEmitter("LeftFire",60,playerEntity,new v2(-2,8),trailTextures,new v2(5,5));
    new trailParticleEmitter("RightFire",60,playerEntity,new v2(2,8),trailTextures,new v2(5,5));

    playerEntity.speed = 10;
    playerEntity.pos = new v2(width / 2,height - 64);
    playerEntity.maxspeed = 128;
    playerEntity.acceleration = 5;
    playerEntity.deceleration = 3;

    BindToKeyDown("arrowleft",() => { playerEntity.left = true; });
    BindToKeyUp("arrowleft",() => { playerEntity.left = false; });

    BindToKeyDown("arrowright",() => { playerEntity.right = true; });
    BindToKeyUp("arrowright",() => { playerEntity.right = false; });

    BindToKeyDown("arrowup",() => { playerEntity.up = true; });
    BindToKeyUp("arrowup",() => { playerEntity.up = false; });

    BindToKeyDown("arrowdown",() => { playerEntity.down = true; });
    BindToKeyUp("arrowdown",() => { playerEntity.down = false; });

    AddTick(dt => {
        playerEntity.speed += dt * (500 - playerEntity.speed) / 2;
        SetSpeed(playerEntity.speed);

        let dir = getDir(playerEntity);
        setDir(playerEntity,dir);

        if (dir.x == 0 && dir.y == 0) {
            playerEntity.velocity = playerEntity.velocity.sub(playerEntity.velocity.multiply(dt).multiply(playerEntity.deceleration));
        } else {
            playerEntity.velocity = playerEntity.velocity.add((new v2(playerEntity.maxspeed * dir.x,playerEntity.maxspeed * dir.y).sub(new v2(playerEntity.velocity.x,playerEntity.velocity.y))).multiply(dt).multiply(playerEntity.acceleration));
        }
        playerEntity.frame(dt);
        playerEntity.render();
    });
}


const setDir = (playerEntity,dir) => {
    if (dir.x != 0 || dir.y != 0) {
        const a = Math.atan2(dir.x,-dir.y);
        playerEntity.trot = a;
    }


    playerEntity.texture = playerEntity.textures.forward;
}

const getDir = playerEntity => {
    let dir = new v2(0,0);

    if (playerEntity.left) {
        dir = dir.sub(new v2(1,0));
    }
    if (playerEntity.right) {
        dir = dir.add(new v2(1,0));
    }
    if (playerEntity.up) {
        dir = dir.sub(new v2(0,1));
    }
    if (playerEntity.down) {
        dir = dir.add(new v2(0,1));
    }

    return dir.unit();
}