import { Layers, width, height } from "../renderer/render.js";
import { Add as AddTick } from "../engine/frame.js";
import { LoadTexture, LoadTextures, TextureBuffer, TextureBuffers } from "../lib/texture.js";
import { v2, entity, trailParticleEmitter, laserParticleEmitter, LaserProjectile } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { SetSpeed } from "./background.js";
import { BindToKeyDown, BindToKeyUp } from "../engine/input.js";
import { LoadWave, SetPlayer } from "./enemies.js";


let lasertextures;
let lasertextures2;
export const Load = async () => {
    SetSpeed(0);
    const playerEntity = new entity("Player",new v2(16,16),new v2(4,4),Layers.Player,await TextureBuffers(await LoadTextures(
        {
            forward: "assets/ship-forward.png"
        }
    ),16,16));
    playerEntity.group = "player";

    lasertextures = await TextureBuffers(await LoadTextures(
        {
            default: "assets/laser1.png"
        }
    ),16,16)

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
    let trail0 = new trailParticleEmitter("LeftFire",60,playerEntity,new v2(-2,8),trailTextures,new v2(5,5));
    let trail1 = new trailParticleEmitter("RightFire",60,playerEntity,new v2(2,8),trailTextures,new v2(5,5));

    lasertextures2 = await TextureBuffers(await LoadTextures(
        {
            frame0: "assets/shootlaser0.png",
            frame1: "assets/shootlaser1.png",
            frame2: "assets/shootlaser2.png",
            frame3: "assets/shootlaser3.png",
            frame4: "assets/shootlaser4.png",
        }
    ),9,9)
    playerEntity.leftLaser = new laserParticleEmitter("LeftLaser",0,playerEntity,new v2(-6,-8),lasertextures2,new v2(9,9));
    playerEntity.rightlaser = new laserParticleEmitter("RightLaser",0,playerEntity,new v2(6,-8),lasertextures2,new v2(9,9));

    playerEntity.speed = 10;
    playerEntity.pos = new v2(width / 2,height - 64);
    playerEntity.maxspeed = 128;
    playerEntity.acceleration = 5;
    playerEntity.deceleration = 3;
    playerEntity.turnspeed = 7;

    playerEntity.shootspeed = 16;
    playerEntity.shootTimer = 0;

    BindToKeyDown("arrowleft",() => { playerEntity.left = true; });
    BindToKeyUp("arrowleft",() => { playerEntity.left = false; });

    BindToKeyDown("arrowright",() => { playerEntity.right = true; });
    BindToKeyUp("arrowright",() => { playerEntity.right = false; });

    BindToKeyDown("arrowup",() => { playerEntity.up = true; });
    BindToKeyUp("arrowup",() => { playerEntity.up = false; });

    BindToKeyDown("arrowdown",() => { playerEntity.down = true; });
    BindToKeyUp("arrowdown",() => { playerEntity.down = false; });

    playerEntity.shoot = {};
    BindToKeyDown("w",() => { playerEntity.shoot.up = true; });
    BindToKeyUp("w",() => { playerEntity.shoot.up = false; });
    
    BindToKeyDown("a",() => { playerEntity.shoot.left = true; });
    BindToKeyUp("a",() => { playerEntity.shoot.left = false; });

    BindToKeyDown("s",() => { playerEntity.shoot.down = true; });
    BindToKeyUp("s",() => { playerEntity.shoot.down = false; });

    BindToKeyDown("d",() => { playerEntity.shoot.right = true; });
    BindToKeyUp("d",() => { playerEntity.shoot.right = false; });


    playerEntity.event = AddTick(dt => {
        playerEntity.speed += dt * (500 - playerEntity.speed) / 2;
        SetSpeed(playerEntity.speed);

        let dir = getDir(playerEntity);
        setDir(playerEntity,dir);

        if (dir.x == 0 && dir.y == 0) {
            playerEntity.velocity = playerEntity.velocity.sub(playerEntity.velocity.multiply(dt).multiply(playerEntity.deceleration));
        } else {
            playerEntity.velocity = playerEntity.velocity.add((new v2(playerEntity.maxspeed * dir.x,playerEntity.maxspeed * dir.y).sub(new v2(playerEntity.velocity.x,playerEntity.velocity.y))).multiply(dt).multiply(playerEntity.acceleration));
        }

        if (playerEntity.shootTimer > 0) { playerEntity.shootTimer -= dt * playerEntity.shootspeed; }
        let shootdir = getDir(playerEntity.shoot);
        if (playerEntity.shootTimer <= 0) {
            playerEntity.shootTimer += 1;
            shoot(playerEntity,shootdir);
        }


        playerEntity.frame(dt);
        playerEntity.render();
    });

    playerEntity.health = 5;
    playerEntity.removing = () => {
        Load();
    }
    playerEntity.died = () => {
        playerEntity.invisible = true;
        playerEntity.inactive = true;

        trail0.rate = 0;
        trail1.rate = 0;
    }

    SetPlayer(playerEntity);
    LoadWave();
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


const shoot = (playerEntity,dir) => {
    playerEntity.leftLaser.emit();
    playerEntity.rightlaser.emit();
    
    const rot = playerEntity.rot;
    const t = new LaserProjectile("PlayerLaser","player",playerEntity.pos,new v2(Math.sin(rot),-Math.cos(rot)).multiply(350),new v2(16,16),new v2(12,12),Layers.Projectiles,lasertextures)
    t.texture = lasertextures.default;
    t.textures2 = lasertextures2;
}