import { v2 } from "../../lib/classes.js";
import { weightCheck } from "../../lib/random.js";
import { height, width } from "../../renderer/render.js";

let player;
let attacks = {
    ram: {weight: 100, ai: (e) => {
        e.timer = 0.8;
        e.chargespeed = 450 + Math.random() * 85;
        
        let t = player.pos.sub(e.pos).magnitude() / e.chargespeed;
        t += Math.sqrt(t) / 3;
        turnTo(e,player.pos.add(player.velocity.multiply(t)));
        e.phase = chargeback;
    }}, chase: {weight: 1, ai: e => {
        e.timer = 10 + Math.random() * 10;
        e.phase = chase;
    }}, center: {weight: 1000000, ai: e => {
        e.timer = 1;


        e.rotspeed = 1;
        e.spos = e.pos;
        e.phase = gotocenter;
    }},
};

export const boss1 = {
    load: (e,plr) => {
        e.timer = 1;
        e.weight = 5;
        e.phase = start;
        e.turnspeed = 3;
        player = plr;
    },
    ai: (e, dt) => {
        e.phase(e,dt);
    },
    died: e => {

    }
}

const start = (e,dt) => {
    e.timer -= dt;
    if (e.timer > 0) { return; }

    gotorandom(e);
}

const gotorandom = e => {
    e.speed = 115 + Math.random() * 35;
    e.phase = going; 
}
const going = (e,dt) => {
    let tpos = player.pos;
    turnTo(e,tpos);
    let d = tpos.sub(e.pos).magnitude();
    let s = e.speed * dt;
    if (s >= d - 128) {
        e.phase = think;
        return;
    }

    let rot = e.rot;
    e.velocity = e.velocity.lerp(new v2(Math.sin(rot),-Math.cos(rot)).multiply(e.speed),dt * 10);
}

const think = (e,dt) => {
    if (!e.thinking) { e.thinking = 1; }
    e.thinking -= dt;
    e.velocity = e.velocity.sub(e.velocity.multiply(dt * 1.1));
    if (e.thinking > 0) { return; }
    e.thinking = undefined;

    let d = player.pos.sub(e.pos).magnitude();
    if (d > 150) { gotorandom(e); return; }

    weightCheck(attacks).ai(e);
}

const turnTo = (e,p) => {
    let d = p.sub(e.pos);
    e.trot = Math.atan2(d.x,-d.y);
}

const chase = (e,dt) => {
    let t = player.pos.sub(e.pos).magnitude() / e.velocity.magnitude();
    t -= Math.sqrt(t) / 3;

    let tpos = player.pos.add(player.velocity.multiply(t));
    turnTo(e,player.pos);

    e.timer -= dt;
    if (e.timer > 0) {
        e.velocity = e.velocity.add(tpos.sub(e.pos).unit().multiply(dt * 350));
        e.velocity = e.velocity.sub(e.velocity.multiply(dt / 2));
        e.dmg = Math.max(5,e.velocity.magnitude() / 40);
        return;
    }
    e.dmg = 1;
    e.phase = think;
}
const chargeback = (e,dt) => {
    let rot = e.rot;
    e.timer -= dt;
    e.velocity = e.velocity.sub(e.velocity.multiply(dt * 1.5));
    if (e.timer > 0) {
        e.velocity = e.velocity.add(new v2(-Math.sin(rot),Math.cos(rot)).multiply((1 - e.timer) * dt * 450));
        return;
    }
    e.dmg = 40;
    e.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(e.chargespeed);
    e.phase = charging;
    e.timer = 0.5;
}
const charging = (e,dt) => {
    e.timer -= dt;
    if (e.timer > 0) { return; }

    e.dmg = 1;
    
    if (Math.random() > 0.5) { attacks.ram.ai(e); } else { e.phase = think; }
}

const gotocenter = (e,dt) => {
    e.timer -= dt;
    e.pos = e.spos.lerp(new v2(width/2,height/2),Math.min(1,1 - e.timer) ** 2);
    if (e.timer > 0) { return; }
    e.timer = 8 + Math.random() * 8;
    e.phase = center;
}
const center = (e,dt) => {
    e.trot += e.rotspeed * dt;
    e.rotspeed += dt;
    e.rot = e.trot;
    e.pos = new v2(width/2,height/2);
    e.velocity = new v2(0,0);

    e.timer -= dt;
    if (e.timer > 0) { return; }

    e.phase = think;
}