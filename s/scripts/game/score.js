import { Add, AddIndependent, Pause, Remove, RemoveIndependent, Resume } from "../engine/frame.js";
import { Anchor, Color, Frame, Scale2, Text, UILayer } from "../engine/ui.js";
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
        console.log(unlocks);

        if (unlocked) { this.unlock(); }
    }

    unlock() {
        if (!availablePathes[this.priority]) { availablePathes[this.priority] = []; }

        table.insert(availablePathes[this.priority],this);
    }
}

let xpmultiplier = 1;
const shop = {
    dmgroot: new Upgrade("+2 damage","The ship lasers\nwill deal an\nadditional\n2 damage\non hit.","Damage",() => { AddPower("dmg",2); }),
    dmgbasic0: new Upgrade("+3 damage","The ship lasers\nwill deal an\nadditional\n3 damage.","Damage basic",() => { AddPower("dmg",3); }),
    dmgpierce0: new Upgrade("+2 pierce","Empowers the lasers\nto pierce through\n2 additional\ntargets.","Damage pierce",() => { AddPower("dmg",3); }),
    dmgspeed0: new Upgrade("+2 speed","Overclocks the laser\nreceptors to shoot\n2 additional\nblasts per\nsecond.","Damage speed",() => { player.shootspeed += 2; AddPower("shootspeed",2); }),

    defenseroot: new Upgrade("+50 hp","The ship can\ntake an\nadditional\n50 hp\nof damage.","Defense",() => { player.health += 50; player.maxhealth += 50; AddPower("maxhealth",50); }),
    utilityroot: new Upgrade("+25% xp","XP drops are\nincreased\nby 25%.","Utility",() => { xpmultiplier += 0.25; })
}
const pathes = [
    new Path("Damagepath",shop.dmgroot,[],true),
    new Path("Defensepath",shop.defenseroot,[],true),
    new Path("Utilitypath",shop.utilityroot,[],true)
];

let ui;

const tsize = async (bg, target) => {
    let initial = bg.size;
    let t = 0;

    await new Promise(completed => {
        let e;
        e = AddIndependent(dt => {
            t += dt * 2;
            if (t > 1) {
                bg.size = target;

                RemoveIndependent(e);
                completed();
                return;
            }

            bg.size = initial.lerp(target,t);
            ui.redraw();
        });
    })
}

const promptPurchase = async completed => {
    let options = availablePathes[0];
    let w = 2;
    let s = 82;

    console.log(options);
    table.iterate(options, option => {
        if (!option) { return; }
        w += s + 2;
    });
    
    let bg = ui.children.bg;
    let target = new Scale2(0,w,.5,0);
    
    await tsize(bg,target);
    await new Promise(completed => {
        let c = {};
        table.iterate(options, (option, index) => {
            if (!option) { return; }
            let upg = option.upgrade;

            let f;
            f = new Frame(
                {
                    pos: new Scale2(0,2 + index * (s + 2),0,2), 
                    size: new Scale2(0,s,1,-4), 
                    anchor: new Anchor(0,0), 
                    color: new Color(0,0,0,255),
                    onclick: () => {
                        upg.callback();
                        bg.children = {};
                        ui.redraw();
                        completed();
                    },
                    onhover: () => {
                        f.color = new Color(0,0,0,192);
                        ui.redraw();
                    },
                    onleave: () => {
                        f.color = new Color(0,0,0,255);
                        ui.redraw();
                    }
                },{
                    title: new Text({text: upg.display, size: new Scale2(1,0,.2,0), textsize: 16}),
                    desc: new Text({text: upg.desc, textsize: 10, size: new Scale2(1,0,.3,0), pos: new Scale2(0,0,.2,0)})
                }
            );
            
            c[option.name] = f
        });
        bg.children = c;
        ui.redraw();
    });

    completed();
}


let score = 0;
let level = 0;
let savedScore = 0;

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
    let levels = false;
    while (true) {
        let levelTreshold = 75 + level * 120;
        if (savedScore < levelTreshold) { break; }

        console.log("Levelup");
        level += 1;
        savedScore -= levelTreshold;
        if (!levels) {
            levels = true;
            ui.children = {
                bg: new Frame({size: new Scale2(0,0,0,0), pos: new Scale2(.5,0,.5,0), anchor: new Anchor(.5,.5), color: new Color(84,82,92,0)})
            };
        }
        Pause();
        await new Promise(promptPurchase);
    }
    if (levels) {
        await tsize(ui.children.bg,new Scale2(0,0,0,0));
        ui.children = {};
        ui.redraw();
        Resume();
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