import { Add, AddIndependent, Pause, Remove, RemoveIndependent, Resume } from "../engine/frame.js";
import { Anchor, Color, Frame, Image, Scale2, Text, UILayer, toSize } from "../engine/ui.js";
import { AmbientEntity, v2 } from "../lib/classes.js";
import { SetSaveKey } from "../lib/data.js";
import { table } from "../lib/table.js";
import { LoadTextures, TextureBuffers } from "../lib/texture.js";
import { Layers } from "../renderer/render.js";
import { AddPower, AddXP } from "./player.js";


class Upgrade {
    constructor(display,desc,slots,callback) {
        this.display = display;
        this.desc = desc;
        this.slots = slots;
        this.callback = callback;
    }
}
const slotpathes = {
    damage: {
        basic: {
            basic: {
                basic: {
                    slot: "damage"
                },
                power: {
                    slot: "utility"
                },
                super: {
                    slot: "defense"
                },
                slot: "damage"
            },
            slot: "damage"
        },
        pierce: {
            basic: {
                basic: {
                    slot: "damage"
                },
                power: {
                    slot: "defense"
                },
                super: {
                    slot: "utility"
                },
                slot: "damage"
            },
            slot: "utility"
        },
        speed: {
            basic: {
                basic: {
                    slot: "damage"
                },
                power: {
                    slot: "utility"
                },
                super: {
                    slot: "defense"
                },
                slot: "damage"
            },
            slot: "defense"
        },
        slot: "damage"
    },
    defense: {
        basic: {
            basic: {
                basic: {
                    slot: "defense"
                },
                power: {
                    slot: "damage"
                },
                super: {
                    slot: "utility"
                },
                slot: "defense"
            },
            slot: "defense"
        },
        health: {
            basic: {
                basic: {
                    slot: "defense"
                },
                power: {
                    slot: "damage"
                },
                super: {
                    slot: "utility"
                },
                slot: "defense"
            },
            slot: "damage"
        },
        toughness: {
            basic: {
                basic: {
                    slot: "defense"
                },
                power: {
                    slot: "damage"
                },
                super: {
                    slot: "utility"
                },
                slot: "defense"
            },
            slot: "utility"
        },
        slot: "defense"
    },
    utility: {
        basic: {
            basic: {
                basic: {
                    slot: "utility"
                },
                power: {
                    slot: "damage"
                },
                super: {
                    slot: "defense"
                },
                slot: "utility"
            },
            slot: "utility"
        },
        laser: {
            basic: {
                basic: {
                    slot: "defense"
                },
                power: {
                    slot: "damage"
                },
                super: {
                    slot: "utility"
                },
                slot: "utility"
            },
            slot: "damage"
        },
        speed: {
            basic: {
                slot: "utility"
            },
            slot: "defense"
        },
        slot: "utility"
    }
}

const loopSlots = (path,index) => {
    Object.entries(path).map(v => {
        const i = v[0];
        const obj = v[1];

        if (typeof obj != "object") { return; }

        loopSlots(obj,index + 1,path);
        obj.parent = path;
    })
}
loopSlots(slotpathes,0);
const findslots = (path,index,callback) => {
    callback(path,index);
    if (!path.parent) { return; }
    
    findslots(path.parent,index + 1,callback);
}
class Slots {
    constructor(path) {
        let ls = [];

        findslots(path,0,(path,index) => {
            ls[index] = path.slot;
        });

        let l = ls.length;
        this.slot0 = ls[l - 2] || "empty";
        this.slot1 = ls[l - 3] || "empty";
        this.slot2 = ls[l - 4] || "empty";
        this.slot3 = ls[l - 5] || "empty";
        this.slot4 = ls[l - 6] || "empty";
    }
}

let availablePathes = {};
let unlockedPathes = {
    DamageStep: 1, DamageSuper: 1,
    DefenseStep: 1, DefenseSuper: 1,
    UtilityStep: 1, UtilitySuper: 1,
};
const unlock = unlocks => {
    if (!unlocks) { return; }
    table.iterate(unlocks,u => { if (!u) { return; } u.priority ++; unlock(u.unlocks); });
}
let allupgrades = {};
class Path {
    constructor(name,path,upg,unlocks,unlocked) {
        this.name = name;
        this.path = path;
        this.upgrade = upg;
        this.unlocks = unlocks;
        this.weight = 1;
        this.priority = 0;
        unlock(this.unlocks);
        allupgrades[name] = this;

        if (unlocked) { this.unlock(); }
    }
    remove() {
        table.remove(availablePathes[this.priority],this);
        if (!unlockedPathes[this.path]) { unlockedPathes[this.path] = 1; return; }
        unlockedPathes[this.path]++;
    }

    unlock() {
        if (!availablePathes[this.priority]) { availablePathes[this.priority] = []; }

        table.insert(availablePathes[this.priority],this);
    }
    buy() {
        if (this.unlocks) { table.iterate(this.unlocks,unlock => { unlock.unlock(); }); }
        this.remove();
        this.upgrade.callback();
    }
}

let xpmultiplier = 1;
let freelevel = 0;
let freelevels = 0;
let leveldamage = 0;
let totalleveldamage = 0;
let absorption = 0;
let maxpaths = 2;
export const SetScoreDifficulty = diff => {
    if (diff.xpmultiplier) { xpmultiplier *= diff.xpmultiplier; }
    if (diff.maxpaths) { maxpaths = diff.maxpaths; }
}
const shop = {
    dmgroot: new Upgrade("Damage","Your ship's lasers will deal an additional 1 damage on hit. Unlocks the damage path.",new Slots(slotpathes.damage),() => { AddPower("dmg",1); }),
    dmgbasic0: new Upgrade("Stronger lasers","Your ship's lasers will deal an additional 1 damage.",new Slots(slotpathes.damage.basic),() => { AddPower("dmg",1); }),
    dmgbasic1: new Upgrade("Laser engine","Unlocks powerful upgrades about laser damage.",new Slots(slotpathes.damage.basic.basic),() => { }),
    dmgbasicbasic: new Upgrade("Powerful lasers","Increases laser damage by 2 with no drawbacks.",new Slots(slotpathes.damage.basic.basic.basic),() => { AddPower("dmg",2); }),
    dmgbasicpower: new Upgrade("Heavy blow","Greatly increases laser damage by 9, but decreases firing speed by 2.",new Slots(slotpathes.damage.basic.basic.power),() => { AddPower("weight",0.1); AddPower("pierce",1); AddPower("dmg",9); player.shootspeed -= 3; AddPower("shootspeed",-2); }),
    dmgbasicsuper: new Upgrade("Power shot","Increases damage by 4 but decreases piercing capabilities by 2.",new Slots(slotpathes.damage.basic.basic.super),() => { AddPower("pierce",-2); AddPower("dmg",4); }),

    dmgpierce0: new Upgrade("Sharp lasers","Empowers the lasers to pierce through 1 additional target.",new Slots(slotpathes.damage.pierce),() => { AddPower("pierce",1); }),
    dmgpierce1: new Upgrade("Laser sharpener","Lasers pierce through 2 more targets. Unlocks powerful upgrades.",new Slots(slotpathes.damage.pierce.basic),() => { AddPower("pierce",2); }),
    dmgpiercebasic: new Upgrade("Razor sharp lasers","Increases laser pierce by 3 with no drawbacks.",new Slots(slotpathes.damage.pierce.basic.basic),() => { AddPower("pierce",3); }),
    dmgpiercepower: new Upgrade("∞ pierce","Shreds through 8 additional targets, but lasers move much slower and deal much less knockback.",new Slots(slotpathes.damage.pierce.basic.power),() => { AddPower("pierce",8); AddPower("laserspeed",-200); }),
    dmgpiercesuper: new Upgrade("Laser shred","Shreds through 5 additional targets, but deal 2 less damage.",new Slots(slotpathes.damage.pierce.basic.super),() => { AddPower("pierce",5); AddPower("dmg",-2); }),

    dmgspeed0: new Upgrade("Quick shot","Overclocks the laser receptors to shoot 1 additional blast per second.",new Slots(slotpathes.damage.speed),() => { player.shootspeed += 1; AddPower("shootspeed",1); AddPower("inaccuracy",0.01); }),
    dmgspeed1: new Upgrade("Power cooler","Unlocks powerful upgrades about laser firing speed.",new Slots(slotpathes.damage.speed.basic),() => { }),
    dmgspeedbasic: new Upgrade("Overclock","Increases attack speed by 2 with no drawbacks.",new Slots(slotpathes.damage.speed.basic.basic), () => { player.shootspeed += 2; AddPower("shootspeed",2)}),
    dmgspeedpower: new Upgrade("Maximum overdrive","Greatly increases attack speed by 6, but decreases attack damage by 3.",new Slots(slotpathes.damage.speed.basic.power), () => { player.shootspeed += 6; AddPower("shootspeed",6); AddPower("dmg",-3)}),
    dmgspeedsuper: new Upgrade("Minigun","Increases attack speed by 3 at the cost of reduced accuracy.",new Slots(slotpathes.damage.speed.basic.super), () => { player.shootspeed += 3; AddPower("shootspeed",3); AddPower("inaccuracy",0.33); }),

    defenseroot: new Upgrade("Defense","Your ship can take an additional 50 hp of damage before getting destroyed. Unlocks the defense path.",new Slots(slotpathes.defense),() => { player.health += 50; player.maxhealth += 50; AddPower("maxhealth",50); }),
    defensebasic0: new Upgrade("Hard plates","Adds hard plating to your ship to resist weaker hits. Increases defense by 4",new Slots(slotpathes.defense.basic),() => { player.defense += 4; AddPower("defense",4); }),
    defensebasic1: new Upgrade("Hard frame","Increases defense by 2. Unlocks powerful upgrades.",new Slots(slotpathes.defense.basic.basic),() => { player.defense += 2; AddPower("defense",2); }),
    defensebasicbasic: new Upgrade("Very hard plates","Increases defense by 4 with no drawbacks.",new Slots(slotpathes.defense.basic.basic.basic),() => { player.defense += 4; AddPower("defense",4); }),
    defensebasicpower: new Upgrade("Heavy plates","Increases defense by 10, but decreases acceleration by 20%.",new Slots(slotpathes.defense.basic.basic.power),() => { player.defense += 10; AddPower("defense",10); AddPower("acceleration",-1.5); player.acceleration -= 1.5; }),
    defensebasicsuper: new Upgrade("Diamond plates","Increases defense by 30, but decreases toughness by 3.",new Slots(slotpathes.defense.basic.basic.super),() => { player.defense += 30; AddPower("defense",30); player.toughness -= 3; AddPower("toughness",-3); }),

    defensehealth0: new Upgrade("Stronger vitality","Your ship can take an additional 75 hp of damage before getting destroyed.",new Slots(slotpathes.defense.health),() => { player.health += 75; player.maxhealth += 75; AddPower("maxhealth",75); }),
    defensehealth1: new Upgrade("Stronger frame","Increases health by 50hp. Unlocks powerful upgrades.",new Slots(slotpathes.defense.health.basic),() => { player.health += 50; player.maxhealth += 50; AddPower("maxhealth",50); }),
    
    defensetoughness0: new Upgrade("Tough plates","Adds tough plating to your ship to weaken strong hits. Increases toughness by 2",new Slots(slotpathes.defense.toughness),() => { player.toughness += 2; AddPower("toughness",2); }),
    defensetoughness1: new Upgrade("Tough frame","Increases toughness by 1. Unlocks powerful upgrades.",new Slots(slotpathes.defense.toughness.basic),() => { player.toughness += 1; AddPower("toughness",1); }),


    utilityroot: new Upgrade("Utility","XP drops are increased by 25%.",new Slots(slotpathes.utility),() => { xpmultiplier *= 1.25; }),
    utilitybasic0: new Upgrade("XP booster","XP drops are increased by an additional 50%.",new Slots(slotpathes.utility.basic), () => { xpmultiplier *= 1.5; }),
    utilitybasic1: new Upgrade("XP engine","Increases XP drops by 10%. Unlocks powerful upgrades.",new Slots(slotpathes.utility.basic.basic),() => { xpmultiplier *= 1.1; }),
    utilitybasicbasic: new Upgrade("XP generator","Grants a free level-up every third round.",new Slots(slotpathes.utility.basic.basic.basic),() => { freelevel += 0.34; }),
    utilitybasicpower: new Upgrade("XP materializer","Increases laser damage by 2 for every level-up.",new Slots(slotpathes.utility.basic.basic.power),() => { leveldamage += 2; }),
    utilitybasicsuper: new Upgrade("Super XP absorber","Gaining XP will heal 6 hp.",new Slots(slotpathes.utility.basic.basic.super),() => { absorption += 6; }),

    utilitylaser0: new Upgrade("Fast lasers","Your ship's lasers will travel much faster and deal more knockback.",new Slots(slotpathes.utility.laser),() => { AddPower("laserspeed",250); AddPower("weight",0.03); }),
    utilitylaser1: new Upgrade("Heavy lasers","Increases laser knockback. Unlocks powerful upgrades.",new Slots(slotpathes.utility.laser.basic),() => { AddPower("laserspeed",50); AddPower("weight",0.02); }),
    utilitylaserbasic: new Upgrade("Mean lasers","Greatly increases laser knockback.",new Slots(slotpathes.utility.laser.basic.basic),() => { AddPower("weight",0.07); }),
    utilitylaserpower: new Upgrade("Tracking lasers","Your lasers will bounce from target to target, but lasers deal 2 less damage.",new Slots(slotpathes.utility.laser.basic.power),() => { AddPower("homing",1); AddPower("dmg",-2); }),
    utilitylasersuper: new Upgrade("Latching lasers","Latches onto enemies when hit, dealing damage over time.",new Slots(slotpathes.utility.laser.basic.super),() => { AddPower("latching",3); }),

    utilityspeed0: new Upgrade("Power engines","Your ship will accelerate twice as fast.",new Slots(slotpathes.utility.speed),() => { player.acceleration += 5; AddPower("acceleration",5); }),
    utilityspeed1: new Upgrade("Side engines","Your ship will rotate 50% faster. Unlocks powerful upgrades.",new Slots(slotpathes.utility.speed.basic),() => { player.turnspeed += 3; AddPower("turnspeed",3); }),
}
const mainpathes = [
    new Path("DamagePath","Root",shop.dmgroot,[
        new Path("DamageBasic","Damage",shop.dmgbasic0,[
            new Path("DamageBasic1","DamageStep",shop.dmgbasic1,[
                new Path("DamageBasicBasic","DamageSuper",shop.dmgbasicbasic,[]),
                new Path("DamageBasicPower","DamageSuper",shop.dmgbasicpower,[]),
                new Path("DamageBasicSuper","DamageSuper",shop.dmgbasicsuper,[]),
            ]),
        ]),
        new Path("DamagePierce","Damage",shop.dmgpierce0,[
            new Path("DamagePierce1","DamageStep",shop.dmgpierce1,[
                new Path("DamagePierceBasic","DamageSuper",shop.dmgpiercebasic,[]),
                new Path("DamagePiercePower","DamageSuper",shop.dmgpiercepower,[]),
                new Path("DamagePierceSuper","DamageSuper",shop.dmgpiercesuper,[]),
            ]),
        ]),
        new Path("DamageSpeed","Damage",shop.dmgspeed0,[
            new Path("DamageSpeed1","DamageStep",shop.dmgspeed1,[
                new Path("DamageSpeedBasic","DamageSuper",shop.dmgspeedbasic,[]),
                new Path("DamageSpeedPower","DamageSuper",shop.dmgspeedpower,[]),
                new Path("DamageSpeedSuper","DamageSuper",shop.dmgspeedsuper,[]),
            ]),
        ]),
    ],true),
    new Path("DefensePath","Root",shop.defenseroot,[
        new Path("DefenseBasic","Defense",shop.defensebasic0,[
            new Path("DefenseBasic1","DefenseStep",shop.defensebasic1,[
                new Path("DefenseBasicBasic","DefenseSuper",shop.defensebasicbasic,[]),
                new Path("DefenseBasicPower","DefenseSuper",shop.defensebasicpower,[]),
                new Path("DefenseBasicSuper","DefenseSuper",shop.defensebasicsuper,[]),]),
        ]),
        new Path("DefenseHealth","Defense",shop.defensehealth0,[
            new Path("DefenseHealth1","DefenseStep",shop.defensehealth1,[]),
        ]),
        new Path("DefenseToughness","Defense",shop.defensetoughness0,[
            new Path("DefenseToughness1","DefenseStep",shop.defensetoughness1,[]),
        ]),
    ],true),
    new Path("UtilityPath","Root",shop.utilityroot,[
        new Path("UtilityBasic","Utility",shop.utilitybasic0,[
            new Path("UtilityBasic1","UtilityStep",shop.utilitybasic1,[
                new Path("UtilityBasicBasic","UtilitySuper",shop.utilitybasicbasic,[]),
                new Path("UtilityBasicPower","UtilitySuper",shop.utilitybasicpower,[]),
                new Path("UtilityBasicSuper","UtilitySuper",shop.utilitybasicsuper,[]),
            ]),
        ]),
        new Path("UtilityLaser","Utility",shop.utilitylaser0,[
            new Path("UtilityLaser1","UtilityStep",shop.utilitylaser1,[
                new Path("UtilityLaserBasic","UtilitySuper",shop.utilitylaserbasic,[]),
                new Path("UtilityLaserPower","UtilitySuper",shop.utilitylaserpower,[]),
                new Path("UtilityLaserSuper","UtilitySuper",shop.utilitylasersuper,[]),
            ]),
        ]),
        new Path("UtilitySpeed","Utility",shop.utilityspeed0,[
            new Path("UtilitySpeed1","UtilityStep",shop.utilityspeed1,[]),
        ]),
    ],true),
];
let savedupgrades = [];

let ui;
let slotTextures;



const weightCheck = array => {
    if (!array) { return 0; }
    let total = 0;
    let opt = [];
    let c = 0, b;
    table.iterate(array,item => {
        if (!item) { return; }
        let w = item.weight;
        c ++;
        b = item;
        if (w <= 0) { item.weight ++; return; }

        table.insert(opt,item);
        total += w;
    });

    if (c == 1) { return b; }
    if (total <= 0) { return 0; }

    let d = 0;
    let n = Math.floor(Math.random() * total);
    let v = 0;
    table.iterate(opt,item => {
        d += item.weight;
        if (n < d) { item.weight = -1; v = item; return -1; }

        item.weight ++;
    });

    return v;
}

const promptPurchase = async completed => {
    let options = [];

    let greatest = 0;
    let least = Infinity;
    let opt = {};
    table.pairs(availablePathes,(priority,array) => {
        if (!array) { return; }
        let opts = [];
        let c = 0;
        table.iterate(array, item => {
            if (!item) { return; }
            let p = unlockedPathes[item.path];
            if (p && p >= maxpaths) { return; }

            c ++;
            table.insert(opts,item);
        });
        if (c <= 0) { return; }

        opt[priority] = opts;
        greatest = Math.max(greatest,priority);
        least = Math.min(priority,least);
    });
    options[0] = weightCheck(opt[greatest]);
    options[1] = weightCheck(opt[greatest]);
    options[2] = weightCheck(opt[least]);

    if (opt[greatest]) {
        let c = 0;
        table.iterate(opt[greatest],opt => {
            if (!opt) { return; }
            c ++;
        });
        if (c == 1) {
            let i = -1;
            table.pairs(opt,I => {
                I = Number(I);
                if (I >= greatest) { return; }

                i = Math.max(i,I);
            })
            if (i > -1) {
                options[0] = weightCheck(opt[greatest]);
                options[1] = weightCheck(opt[i]);
            }
        }
    }
    if (options[2]) { options[2].weight = 0; }
    
    let w = 2;
    let s = 94;
    table.iterate(options, option => {
        if (!option) { return; }
        w += s + 2;
    });
    
    let bg = ui.children.bg;
    let target = new Scale2(0,w,.5,0);
    
    let opts = 0;
    table.iterate(options, option => { if (!option) { return; } opts ++; });
    if (opts <= 0) { completed(); return; }

    await toSize(ui, bg,target,0.5);
    await new Promise(completed => {
        let c = {};
        let canclick = true;
        let index = 0;
        table.iterate(options, option => {
            if (!option) { return; }
            let upg = option.upgrade;
            option.weight = Math.max(option.weight,0);

            let slots = {};
            for (let i=0; i<5; i++) {
                let s = "slot"+i;
                slots[s] = new Image({size: new Scale2(0,6,0,6),pos: new Scale2(0,2 + i * 8,1,-2), anchor: new Anchor(0,1), image: slotTextures[upg.slots[s]]});
            }
            let f;
            f = new Frame(
                {
                    pos: new Scale2(0,2 + index * (s + 2),0,2), 
                    size: new Scale2(0,s,1,-4), 
                    anchor: new Anchor(0,0), 
                    color: new Color(0,0,0,255),
                    onclick: () => {
                        if (!canclick) { return; }
                        canclick = false;
                        table.insert(savedupgrades,option.name);
                        SetSaveKey("upgrades",savedupgrades);
                        option.buy();
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
                    title: new Text({text: upg.display, size: new Scale2(1,0,.3,0), textsize: 14}),
                    desc: new Text({text: upg.desc, textsize: 10, size: new Scale2(1,0,.3,0), pos: new Scale2(0,0,.25,0)}),
                    ...slots
                }
            );
            
            c[option.name] = f
            index ++;
        });

        if (index <= 0) {
            completed();
            return;
        }
        c.title = new Text({pos: new Scale2(.5,0,0,0), size: new Scale2(5,0,0,64), anchor: new Anchor(.5,.5), text: "Choose upgrade", textsize: 25});
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
const spawn = (x,y,S,textures,texture) => {
    let p = new AmbientEntity("XP",new v2(S,S),new v2(S,S),Layers.XP,textures);
    p.texture = texture;
    p.pos = new v2(x,y);
    const rot = Math.random() * Math.PI * 2;
    p.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(50 + Math.random() * 90);
    
    let opos;
    let timer = 0;
    let speed = 0;
    let e;
    let s = (0.8 + Math.random() * 2);
    e = Add(dt => {
        timer += dt * s;
        if (timer < 1) { p.frame(dt); p.render(dt); return; }
        if (!opos) { opos = p.pos; }
        speed += dt * s;
        if (speed < 1) {
            p.pos = opos.lerp(player.pos,speed * speed);
            p.render(dt);
            return;
        }
        p.destroy();
        Remove(e);
    });
}
const spawnTiny = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,4,xptextures4,xptextures4.tiny);
    }
}
const spawnSmall = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,4,xptextures4,xptextures4.small);
    }
}
const spawnMedium = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,6,xptextures6,xptextures6.medium);
    }
}
const spawnBig = (count,x,y) => {
    for (let i=0;i<count;i++) {
        spawn(x,y,6,xptextures6,xptextures6.big);
    }
}

let shouldunlock = false;
export const SetPlayer = plr => {
    player = plr;
    if (!shouldunlock) { return; }
    shouldunlock = false;
    
    table.iterate(savedupgrades,upg => {
        allupgrades[upg].buy();
    });
}

let totalxp = 0;
let savedtotalxp = 0;
export const SetScore = sc => {
    savedScore = sc * xpmultiplier;
    score = savedScore;
    totalxp = savedScore;
    console.log(score);
}

const updatexp = () => {
    let xp = score;
    let t = 0;
    let lvl = level;
    let l = 0;
    while (true) {
        t = 75 + lvl * 120;
        if (xp < t) { break; }

        xp -= t;
        l ++;
        lvl ++;
    }
    AddXP(xp,t,l);
}
export const AddScore = (sc,x,y) => {
    player.heal(absorption);
    sc *= xpmultiplier;
    score += sc;
    totalxp += sc;

    updatexp();
    
    let big = Math.floor(sc / 10);
    sc -= big * 8;
    let medium = Math.floor(sc / 8);
    sc -= medium * 6;
    let small = Math.floor(sc / 3);
    sc -= small / 2;
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
    SetSaveKey("score",savedScore);
    savedtotalxp = totalxp;
    let levels = false;
    freelevels += freelevel;
    while (true) {
        let levelTreshold = 75 + level * 120;
        if (freelevels > 0) { freelevels -= 1; } else {
            if (savedScore < levelTreshold) { break; }
            
            level += 1;
            savedScore -= levelTreshold;
        }

        console.log("Levelup");
        AddPower("dmg",leveldamage);
        console.log(leveldamage);
        totalleveldamage += leveldamage;
        if (!levels) {
            levels = true;
            ui.children = {
                bg: new Frame({size: new Scale2(0,0,0,0), pos: new Scale2(.5,0,.5,0), anchor: new Anchor(.5,.5), color: new Color(84,82,92,0)})
            };
        }
        Pause();
        await new Promise(promptPurchase);
        
        SetSaveKey("level",level);
        SetSaveKey("score",savedScore);
    }
    if (levels) {
        await toSize(ui,ui.children.bg,new Scale2(0,0,0,0),0.5);
        ui.children = {};
        ui.redraw();
        Resume();
    }
    
    score = savedScore;
    updatexp();
}
export const LoadScore = () => {
    score = savedScore;
    totalxp = savedtotalxp;
}
export const Load = async savedata => {
    xptextures4 = await TextureBuffers(await LoadTextures({
        tiny: "assets/xptiny.png",
        small: "assets/xpsmall.png"
    }),4,4);
    
    xptextures6 = await TextureBuffers(await LoadTextures({
        medium: "assets/xpmedium.png",
        big: "assets/xpbig.png"
    }),6,6);

    slotTextures = await TextureBuffers(await LoadTextures({
        empty: "assets/slot-empty.png",
        damage: "assets/slot-attack.png",
        defense: "assets/slot-defense.png",
        utility: "assets/slot-utility.png"
    }),6,6);

    ui = new UILayer(Layers.shop);

    savedScore = savedata.score || 0;
    level = savedata.level || 0;

    savedupgrades = savedata.upgrades || [];
    shouldunlock = true;
}