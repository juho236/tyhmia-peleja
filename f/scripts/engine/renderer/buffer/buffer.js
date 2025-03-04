export const CreateBlankBuffer = (x,y) => {
    const c = document.createElement("canvas");
    c.width = x;
    c.height = y;

    let ctx = c.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    return {Buffer: c,Draw: ctx};
}