import { GenericActionState } from "./actionstates.js";

export const AttackState = {
    Check: (entity) => {
        return GenericActionState.Check(entity) && !entity.InAttack;
    },
    Init: GenericActionState.Init,
    Final: GenericActionState.Final
}