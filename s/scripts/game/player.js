import { Layers, width, height } from "../renderer/render.js";
import { Add as AddTick } from "../engine/frame.js";
import { LoadTexture, TextureBuffer } from "../lib/texture.js";
import { v2, entity } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { SetSpeed } from "./background.js";
import { BindToKeyDown, BindToKeyUp } from "../engine/input.js";

export const Load = async () => {
    SetSpeed(0);
    const playerEntity = new entity("Player",new v2(16,16),Layers.Player,await TextureBuffer(await LoadTexture("assets/ship-forward.png"),16,16));
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
        playerEntity.speed += dt * (200 - playerEntity.speed) / 5;
        SetSpeed(playerEntity.speed);

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

        dir = dir.unit();

        if (dir.x == 0 && dir.y == 0) {
            playerEntity.velocity = playerEntity.velocity.sub(playerEntity.velocity.multiply(dt).multiply(playerEntity.deceleration));
        } else {
            playerEntity.velocity = playerEntity.velocity.add((new v2(playerEntity.maxspeed * dir.x,playerEntity.maxspeed * dir.y).sub(new v2(playerEntity.velocity.x,playerEntity.velocity.y))).multiply(dt).multiply(playerEntity.acceleration));
        }
        playerEntity.frame(dt);
        playerEntity.render();
    });
}