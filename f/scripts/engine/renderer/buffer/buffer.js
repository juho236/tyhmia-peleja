export const CreateBlankBuffer = (x,y) => {
    const c = document.createElement("canvas");
    c.width = x;
    c.height = y;
    return {Buffer: c,Draw: c.getContext("2d")};
}