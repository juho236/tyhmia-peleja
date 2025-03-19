import { Layers } from "../../engine/renderer/index.js";
import { Textures } from "../../textures/textures.js";
import { AnimatedHitboxEntity } from "../entities/hitboxes.js";
import { Vector2 } from "../position.js";
import { CheckState, SetState, States } from "../states/index.js";

const weapon = {};

weapon.Init = entity => {

}
weapon.AttackCheck = entity => {
    if (!entity.Attack) { return; }

    weapon.Attack0(entity);
}

weapon.DoAttack0 = entity => {
    entity.AttackHitbox.Activate(0.1);
}
weapon.Attack0 = entity => {
    if (!CheckState(entity,States.Attack)) { return; }
    SetState(entity,States.Attack);
    entity.InAttack = true;
    entity.AttackTimer = 0.1;
    entity.AttackCooldown = 0.35;
    entity.DoAttack = weapon.DoAttack0;

    if (!entity.AttackHitbox) {
        const def = Textures.Weapons.Default;
        entity.AttackHitbox = new AnimatedHitboxEntity(entity,new Vector2(2.6,2.4),new Vector2(1.25,0),Layers.particles,[
            def.Slash0,def.Slash1,def.Slash2,def.Slash3,def.Slash4,def.Slash5,def.Slash6,def.Slash7,def.Slash8
        ],32,32,0.19);

        entity.AttackHitbox.start();
        return;
    }
    entity.AttackHitbox.restart();
}

export default weapon;