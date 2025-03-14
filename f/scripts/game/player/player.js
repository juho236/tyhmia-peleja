import { CreatureBase } from "../../classes/entities/creature.js";
import { Vector2 } from "../../classes/position.js";
import { Layers } from "../../engine/renderer/index.js";
import { Textures } from "../../textures/textures.js";
import { TickCamera, UpdateCamera } from "../camera/camera.js";
import { BindToPress, BindToRelease } from "./input.js";

export const LoadPlayer = async () => {
    spawnPlayer();
}



const spawnPlayer = () => {
    const player = new CreatureBase(new Vector2(0,1.125),new Vector2(0.75,0.75),0,Layers.player,Textures.Player.Temp,12,12);

    BindToPress("Left",() => { player.Left = true; player.LeftBuffered = true; });
    BindToRelease("Left",() => { player.Left = false; });
    BindToPress("Right",() => { player.Right = true; player.RightBuffered = true; });
    BindToRelease("Right",() => { player.Right = false; });
    BindToPress("Jump",() => { player.Jump = true; player.JumpBuffered = true; });
    BindToRelease("Jump",() => { player.Jump = false; });
    BindToPress("Dash",() => { player.Dash = true; });

    player.Speed = 4;
    player.JumpPower = 6;
    player.JumpStrength = 28;
    player.JumpTimer = 0;
    player.DashCooldown = 0;
    player.Direction = 1;

    player.AI = dt => {
        let speed = player.Speed;
        let dir = 0;
        if (player.Left || player.LeftBuffered) { dir -= 1; }
        player.LeftBuffered = false;
        if (player.Right || player.RightBuffered) { dir += 1; }
        player.RightBuffered = false;
        if (dir != 0) { player.Direction = dir; }

        player.JumpTimer -= dt;
        if (player.onground > 0 && (player.Jump || player.JumpBuffered)) {
            player.Jumping = true;
            player.JumpTimer = 0.5;
            player.velocity.Y = -player.JumpPower;
        }
        if (player.velocity.Y > 0) { player.Jumping = false; }
        if (player.Jumping && player.JumpTimer > 0) {
            if (player.Jump) { player.velocity.Y -= player.JumpStrength * dt; } else { player.Jumping = false; }
        }
        player.JumpBuffered = false;

        player.DashCooldown -= dt;
        if (player.Dash && player.DashCooldown <= 0) {
            player.DashCooldown = 0.65;
            player.setvelocity(player.Direction * 15,0,0.2);
        }
        player.Dash = false;

        player.velocity = new Vector2(dir * speed,player.velocity.Y);
        TickCamera(player,dt);
    }
    player.postRender = (t,dt) => {
        UpdateCamera(player,t,dt);
    }

    player.start();
}