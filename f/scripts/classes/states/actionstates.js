export const GenericActionState = {
    Check: entity => {
        return !entity.InAction;
    },
    Init: entity => {
        entity.InAction = true;
    },
    Final: entity => {
        entity.InAction = false;
    }
}

export const DashState = {
    Check: entity => {
        return GenericActionState.Check(entity);
    },
    Init: GenericActionState.Init,
    Final: GenericActionState.Final
}