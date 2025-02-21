import { Layers, width, height, GetMouse, Shake } from "../renderer/render.js";
import { Add as AddTick, CancelFrame, SetFPSCallback } from "../engine/frame.js";
import { LoadTexture, LoadTextures, TextureBuffer, TextureBuffers } from "../lib/texture.js";
import { v2, entity, laserParticleEmitter, LaserProjectile, dustParticleEmitter, fireParticleEmitter } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { SetSpeed } from "./background.js";
import { BindToKeyDown, BindToKeyUp } from "../engine/input.js";
import { LoadWave, SetPlayer } from "./enemies.js";
import { SetPlayer as SetPlayer2 } from "./score.js";
import { UILayer, Frame, Text, Scale2, Anchor, Color, Image } from "../engine/ui.js";
import { LoadScore } from "./score.js";
import { PauseGame } from "./settings.js";

let power = {
    maxhealth: 75,
    pierce: 4,
    dmg: 6,
    defense: 0,
    toughness: 0,
    shootspeed: 6,
    laserspeed: 350,
    turnspeed: 7,
    acceleration: 5,
    weight: 0.02,
    sweight: 3,
    inaccuracy: 0.05,
    homing: 0,
    latching: 0,
    regen: 0,
    leech: 0,
    contactdamage: 50,
}
export const AddPower = (key, value) => {
    power[key] += value;
}

let lasertextures;
let lasertextures2;
let playerEntity;
export const SetPlayerDifficulty = diff => {
    power.damagemultiplier = diff.damagemultiplier;
    power.defensemultiplier = diff.defensemultiplier;
    playerEntity.damagemultiplier = diff.damagemultiplier;
    playerEntity.defensemultiplier = diff.defensemultiplier;
}
let addxp;
export const AddXP = (xp,max,levels) => {
    addxp(xp,max,levels);
}

export const Load = async () => {
    SetSpeed(0);
    playerEntity = new entity("Player",new v2(16,16),new v2(4,4),Layers.Player,await TextureBuffers(await LoadTextures(
        {
            default: "assets/ship-forward.png"
        }
    ),16,16));
    playerEntity.group = "player";
    playerEntity.dmg = power.contactdamage;
    playerEntity.regen = power.regen;
    playerEntity.damagemultiplier = power.damagemultiplier;
    playerEntity.defensemultiplier = power.defensemultiplier;
    playerEntity.texture = playerEntity.textures.default;
    playerEntity.inv = 2;

    lasertextures = await TextureBuffers(await LoadTextures(
        {
            default: "assets/laser1.png"
        }
    ),16,16)
    let scrap = await TextureBuffers(await LoadTextures(
        {
            dust0: "assets/scrap0.png",
            dust1: "assets/scrap1.png",
            dust2: "assets/scrap2.png",
        }
    ),4,4);
    let explode = await TextureBuffers(await LoadTextures(
        {
            full0: "assets/trail-full0.png",
            full1: "assets/trail-full1.png",
            full2: "assets/trail-full2.png",
            full3: "assets/trail-full3.png",
            smoke0: "assets/trail-smoke0.png",
            smoke1: "assets/trail-smoke1.png",
        }
    ),5,5);

    lasertextures2 = await TextureBuffers(await LoadTextures(
        {
            frame0: "assets/shootlaser0.png",
            frame1: "assets/shootlaser1.png",
            frame2: "assets/shootlaser2.png",
            frame3: "assets/shootlaser3.png",
            frame4: "assets/shootlaser4.png",
        }
    ),9,9);
    playerEntity.leftLaser = new laserParticleEmitter("LeftLaser",0,playerEntity,new v2(-6,-8),lasertextures2,new v2(9,9));
    playerEntity.rightlaser = new laserParticleEmitter("RightLaser",0,playerEntity,new v2(6,-8),lasertextures2,new v2(9,9));

    playerEntity.speed = 10;
    playerEntity.pos = new v2(width / 2,height - 64);
    playerEntity.maxspeed = 128;
    playerEntity.acceleration = power.acceleration;
    playerEntity.deceleration = 3;
    playerEntity.turnspeed = power.turnspeed;
    playerEntity.weight = 3;
    playerEntity.isPlayer = true;
    //playerEntity.nocollisioncheck = true;

    playerEntity.shootspeed = power.shootspeed;
    playerEntity.shootTimer = 0;

    BindToKeyDown("a",() => { playerEntity.left = true; });
    BindToKeyUp("a",() => { playerEntity.left = false; });

    BindToKeyDown("d",() => { playerEntity.right = true; });
    BindToKeyUp("d",() => { playerEntity.right = false; });

    BindToKeyDown("w",() => { playerEntity.up = true; });
    BindToKeyUp("w",() => { playerEntity.up = false; });

    BindToKeyDown("s",() => { playerEntity.down = true; });
    BindToKeyUp("s",() => { playerEntity.down = false; });

    BindToKeyUp("r",() => { if (playerEntity.deathtimer && playerEntity.deathtimer <= 0) { remove(); } })
    BindToKeyDown("escape",() => { PauseGame(); });

    const remove = () => {
        CancelFrame(async () => { playerEntity.destroy(); await Load(); });
    }

    playerEntity.defense = power.defense;
    playerEntity.toughness = power.toughness;
    playerEntity.weight = power.sweight;
    playerEntity.maxhealth = power.maxhealth;
    playerEntity.health = playerEntity.maxhealth;

    let hud = new UILayer(Layers.hud);
    hud.children = {
        healthbar: new Frame({size: new Scale2(0,64,0,16), pos: new Scale2(1,0,1,0), anchor: new Anchor(1,1), color: new Color(32,24,48,0)},{
            inset: new Frame({size: new Scale2(1,-2,1,-2), pos: new Scale2(0.5,0,0.5,0), anchor: new Anchor(0.5,0.5), color: new Color(255,0,0,0)},{
                bar: new Frame({size: new Scale2(1,0,1,0), pos: new Scale2(0,0,0,0), anchor: new Anchor(0,0), color: new Color(0,255,0,0)}),
                counter: new Text({anchor: new Anchor(.5,.5), pos: new Scale2(.5,0,0,1), color: new Color(0,0,0,0), textsize: 10, text: "75/75"})
            })
        }),
        xpbar: new Frame({size: new Scale2(0,48,0,4), pos: new Scale2(1,0,1,-16), anchor: new Anchor(1,1), color: new Color(32,24,48,0)},{
            inset: new Frame({size: new Scale2(1,-2,1,-2), pos: new Scale2(0.5,0,0.5,0), anchor: new Anchor(0.5,0.5), color: new Color(0,0,0,0)},{
                bar: new Frame({size: new Scale2(0,0,1,0), pos: new Scale2(0,0,0,0), anchor: new Anchor(0,0), color: new Color(64,0,128,0)}),
                levels: new Text({anchor: new Anchor(.65,1), size: new Scale2(1,0,0,8), pos: new Scale2(0,0,1,0), textsize: 10, text: "0"})
            })
        }),
        settingsicon: new Image({size: new Scale2(0,25,0,12), pos: new Scale2(0,2,0,2), image: await TextureBuffer(await LoadTexture("assets/pause.png"),25,12)}),
        framerate: new Text({size: new Scale2(0,75,0,16), pos: new Scale2(1,0,0,0), anchor: new Anchor(1,0), textsize: 14, text: "0fps"})
        //death: new Frame({size: new Scale2(0,128,)})
    }
    hud.redraw();
    let healthbar = hud.children.healthbar.children.inset.children.bar;
    let hptext = hud.children.healthbar.children.inset.children.counter;
    let xpbar = hud.children.xpbar.children.inset.children.bar;
    let leveltext = hud.children.xpbar.children.inset.children.levels;
    let fpstext = hud.children.framerate;
    let death = hud.children.death;
    SetFPSCallback(fps => { fpstext.text = `${fps}fps`; });

    playerEntity.died = () => {
        playerEntity.invisible = true;
        playerEntity.inactive = true;
        playerEntity.deathtimer = 1;
        Shake(25,2);
        Shake(50,0.5);
        hud.remove();

        for (let i=0;i<32;i++) { playerEntity.scraps.emit(); }
        for (let i=0;i<128;i++) { playerEntity.explode.emit(); }

        //trail0.rate = 0;
        //trail1.rate = 0;
        //playerEntity.destroy();
    }

    playerEntity.scraps = new dustParticleEmitter("Scrap",0,playerEntity,new v2(0,0),scrap,new v2(4,4));
    playerEntity.explode = new fireParticleEmitter("Explode",0,playerEntity,new v2(0,0),explode,new v2(5,5));

    const drawhp = () => {
        if (playerEntity.dead) {
            healthbar.size = new Scale2(0,0,1,0);
            hptext.text = "dead";
            return;
        }
        healthbar.size = new Scale2(playerEntity.health / playerEntity.maxhealth,0,1,0);
        hptext.text = Math.max(1,Math.ceil(playerEntity.health * 10) / 10) + "/" + Math.max(1,playerEntity.maxhealth);
    }

    playerEntity.ondamage = (p,dmg,dmgr) => {
        Shake(dmg / 2,0.5);

        if (!dmgr) { return; }
        playerEntity.velocity = playerEntity.velocity.add(dmgr.velocity.multiply((dmgr.weight || 1) / playerEntity.weight));
    }
    addxp = (xp,max,levels) => {
        xpbar.size = new Scale2(xp / max,0,1,0);
        leveltext.text = levels.toString();
    }

    
    playerEntity.event = AddTick(dt => {
        if (playerEntity.deathtimer) { playerEntity.deathtimer -= dt; if (playerEntity.deathtimer <= -2) { remove(); return -1; }}
        playerEntity.speed += dt * (500 - playerEntity.speed) / 2;
        SetSpeed(playerEntity.speed);

        let dir = getDir(playerEntity);
        let sDir = GetMouse().sub(playerEntity.pos).unit();
        setDir(playerEntity,sDir);

        if (dir.x == 0 && dir.y == 0) {
            playerEntity.velocity = playerEntity.velocity.sub(playerEntity.velocity.multiply(dt).multiply(playerEntity.deceleration));
        } else {
            playerEntity.velocity = playerEntity.velocity.add((new v2(playerEntity.maxspeed * dir.x,playerEntity.maxspeed * dir.y).sub(new v2(playerEntity.velocity.x,playerEntity.velocity.y))).multiply(dt).multiply(playerEntity.acceleration));
        }

        if (playerEntity.shootTimer > 0) { playerEntity.shootTimer -= dt * playerEntity.shootspeed; }
        if (playerEntity.shootTimer <= 0 && !playerEntity.inactive) {
            playerEntity.shootTimer += 1;
            shoot(playerEntity,playerEntity.rot);
        }


        playerEntity.frame(dt);
        playerEntity.render(dt);
        
        drawhp();
        hud.redraw();
    });

    SetPlayer(playerEntity);
    SetPlayer2(playerEntity);
    LoadScore();
    LoadWave();
}


const setDir = (playerEntity,dir) => {
    if (dir.x != 0 || dir.y != 0) {
        const a = Math.atan2(dir.x,-dir.y);
        playerEntity.trot = a;
    }
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
    
    dir += (Math.random() - 0.5) * power.inaccuracy;
    const t = new LaserProjectile("PlayerLaser","player",playerEntity.pos.add(new v2(Math.sin(dir),-Math.cos(dir)).multiply(8)),new v2(Math.sin(dir),-Math.cos(dir)).multiply(power.laserspeed),new v2(16,16),new v2(32,32),Layers.Projectiles,lasertextures)
    t.texture = lasertextures.default;
    t.textures2 = lasertextures2;

    
    t.pierce = power.pierce;
    t.dmg = Math.max(1,power.dmg);
    t.weight = power.weight;
    t.homing = power.homing;
    t.latching = power.latching;
    t.leech = power.leech;
    t.leechtarget = playerEntity;
}