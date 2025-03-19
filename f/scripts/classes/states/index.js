import { DashState } from "./actionstates.js";
import { AttackState } from "./attackstates.js";

export const CheckState = (entity,state) => {
    return !state || !state.Check || state.Check(entity);
}
export const SetState = (entity,state) => {
    if (entity.CurrentState && entity.CurrentState.Final) { entity.CurrentState.Final(entity); }
    entity.CurrentState = state;
    if (state && state.Init) { state.Init(entity); }
}
export const States = {
    Attack: AttackState,
    Dash: DashState
}