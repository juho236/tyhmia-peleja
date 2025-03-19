import { SetState } from "../states/index.js";
import def from "./default.js";

const weapons = {
    Default: def
}


export const SetWeapon = (entity,id) => {
    const weapon = weapons[id];
    if (!weapon) { return; }

    if (weapon.Init) { weapon.Init(entity); }
    entity.CurrentWeapon = weapon;
    entity.WeaponStep = step;
}

const step = (entity,dt) => {
    const weapon = entity.CurrentWeapon;
    if (!weapon) { return; }
    if (weapon.AttackCheck) { weapon.AttackCheck(entity); }

    if (!entity.InAttack) { return; }
    
    entity.AttackTimer -= dt;
    if (entity.AttackTimer > 0) { return; }
    
    if (entity.DoAttack) { entity.DoAttack(entity); entity.DoAttack = undefined; }

    entity.AttackCooldown -= dt;
    if (entity.AttackCooldown > 0) { return; }
    entity.InAttack = false;
    SetState(entity,undefined);
}