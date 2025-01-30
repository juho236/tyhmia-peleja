import { Add, Pause, Remove } from "../engine/frame.js";
import { Frame, Scale2, UILayer } from "../engine/ui.js";
import { AmbientEntity, v2 } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { LoadTextures, TextureBuffers } from "../lib/texture.js";
import { Layers } from "../renderer/render.js";
import { AddPower } from "./player.js";


class Upgrade {
    constructor(display,desc,path,callback) {
        this.display = display;
        this.desc = desc;
        this.path = path;
        this.callback = callback;
    }
}

let availablePathes = {};
class Path {
    constructor(name,upg,unlocks,unlocked) {
        this.name = name;
        this.upgrade = upg;
        this.unlocks = unlocks;
        this.weight = 1;
        this.priority = 0;

        if (unlocked) { this.unlock(); }
    }

    unlock() {
        if (availablePathes[this.priority]) { availablePathes[this.priority] = []; }

        table.insert(availablePathes[this.priority],this);
    }
}

let xpmultiplier = 1;
const shop = {
    dmgroot: new Upgrade("+2 damage","The ship lasers will deal an additional 2 damage on hit.","Damage",() => { AddPower("dmg",2); }),
    dmgbasic0: new Upgrade("+3 damage","The ship lasers will deal an additional 3 damage.","Damage basic",() => { AddPower("dmg",3); }),
    dmgpierce0: new Upgrade("+2 pierce","Empowers the lasers to pierce through 2 additional targets.","Damage pierce",() => { AddPower("dmg",3); }),
    dmgspeed0: new Upgrade("+2 speed","Overclocks the laser receptors to shoot 2 additional blasts per second.","Damage speed",() => { player.shootspeed += 2; AddPower("shootspeed",2); }),

    defenseroot: new Upgrade("+50 hp","The ship can take an additional 50 hp of damage.","Defense",() => { player.health += 50; player.maxhealth += 50; AddPower("maxhealth",50); }),
    utilityroot: new Upgrade("+25% xp","XP drops are increased by 25%.","Utility",() => { xpmultiplier += 0.25; })
}
const pathes = [
    new Path("Damagepath",shop.dmgroot,[],true)
];

let ui;
const promptPurchase = completed => {
    let options = availablePathes[0];
    let w = 2;
    ui.children = {
        bg: new Frame({pos: new Scale2(0,w,.5,0)})
    };
}


let score = 0;
let level = 0;
let savedScore = 100;

let xptextures4;
let xptextures6;

let player;
const spawn = (x,y,textures,texture) => {
    let p = new AmbientEntity("XPSmall",new v2(4,4),new v2(4,4),Layers.XP,textures);
    p.texture = texture;
    p.pos = new v2(x,y);
    const rot = Math.random() * Math.PI * 2;
    p.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(50 + Math.random() * 40);
    
    let opos;
    let timer = 0;
    let speed = 0;
    let e;
    e = Add(dt => {
        timer += dt * (1 + Math.random());
        if (timer < 1) { p.frame(dt); p.render(); return; }
        if (!opos) { opos = p.pos; }
        speed += dt * (1 + Math.random());
        if (speed < 1) {
            p.pos = opos.lerp(player.pos,speed * speed);
            p.render();
            return;
        }
        p.destroy();
        Remove(e);
    });
}
const spawnTiny = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,xptextures4,xptextures4.tiny);
    }
}
const spawnSmall = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,xptextures4,xptextures4.small);
    }
}
const spawnMedium = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,xptextures6,xptextures6.medium);
    }
}
const spawnBig = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,xptextures6,xptextures6.big);
    }
}

export const SetPlayer = plr => {
    player = plr;
}

export const AddScore = (sc,x,y) => {
    score += sc * xpmultiplier;
    
    let big = Math.floor(sc / 50);
    sc -= big * 50;
    let medium = Math.floor(sc / 20);
    sc -= medium * 20;
    let small = Math.floor(sc / 5);
    sc -= small * 5;
    let tiny = sc;

    spawnBig(big,x,y);
    spawnMedium(medium,x,y);
    spawnSmall(small,x,y);
    spawnTiny(tiny,x,y);
}
export const GetScore = () => {
    return score;
}
export const SaveScore = async () => {
    savedScore = score;
    while (true) {
        let levelTreshold = 75 + level * 120;
        if (savedScore < levelTreshold) { break; }

        console.log("Levelup");
        level += 1;
        savedScore -= levelTreshold;
        Pause();
        await new Promise(promptPurchase);
    }
    score = savedScore;
}
export const LoadScore = () => {
    score = savedScore;
}
export const Load = async () => {
    xptextures4 = await TextureBuffers(await LoadTextures({
        tiny: "assets/xptiny.png",
        small: "assets/xpsmall.png"
    }),4,4);
    
    xptextures6 = await TextureBuffers(await LoadTextures({
        medium: "assets/xpmedium.png",
        big: "assets/xpbig.png"
    }),6,6);

    ui = new UILayer(Layers.shop);
}