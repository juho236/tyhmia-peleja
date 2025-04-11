import { transform, v2 } from "../../lib/classes.js";
import { height, Layers, width } from "../../renderer/render.js";

let player;
let hardattacks;
let impossibleattacks;
let nightmareattacks;
export const chargeship = {
    load: (e,plr,hardmode,impossiblemode,nightmaremode) => {
        hardattacks = hardmode;
        impossibleattacks = impossiblemode;
        nightmareattacks = nightmaremode;
        e.timer = -0.2;
        e.speed = 92;
        e.acceleration = 3;
        e.chargespeed = 1/3;
        e.chargetime = 0.7;
        e.chargepreparetime = 0.7;
        e.charge = 350;
        if (hardattacks) { e.speed += 32; e.acceleration += 0.2; e.chargepreparetime -= 0.2; }
        if (impossibleattacks) { e.acceleration += 1.2; e.charge += 100; e.chargetime -= 0.2; e.chargepreparetime -= 0.1; e.chargespeed += 0.2; }
        if (nightmareattacks) { e.charge -= 50; e.chargetime -= 0.2; e.chargepreparetime -= 0.1; e.chargespeed += 0.8; e.speed -= 24;}
        player = plr;
    },
    ai: (e,dt) => {
        let d = player.pos.sub(e.pos);

        e.timer += e.chargespeed * dt;
        if (e.timer >= 1) {
            e.timer -= 1;
            charge(e);
        }

        e.dmg = 3;
        if (e.chargepreparing) {
            e.velocity = e.velocity.sub(new v2(e.velocity.x,e.velocity.y).multiply(dt * e.acceleration));
            e.chargepreparing -= dt;
            if (e.chargepreparing > 0) { return; }
            e.chargepreparing = undefined;
            docharge(e);
        }
        
        if (e.charging) {
            e.dmg = 40;
            e.charging -= dt;
            if (e.charging > 0) { return; }
            e.charging = undefined;
        }
        e.trot = Math.atan2(d.x,-d.y);
        if (d.magnitude() <= 32) { charge(e); return; }
        let dir = d.unit();
        e.velocity = e.velocity.add((new v2(e.speed * dir.x,e.speed * dir.y).sub(new v2(e.velocity.x,e.velocity.y))).multiply(dt * e.acceleration));      
    }
}


const charge = e => {
    if (e.chargepreparing) { return; }
    e.chargepreparing = e.chargepreparetime;
    const d = player.pos.add(player.velocity.multiply(e.chargepreparetime + player.pos.sub(e.pos).magnitude() / e.charge)).sub(e.pos);
    e.trot = Math.atan2(d.x,-d.y);
}
const docharge = e => {
    const rot = e.trot;
    e.velocity = new v2(Math.sin(rot),-Math.cos(rot)).multiply(e.charge);
    e.charging = e.chargetime;
}