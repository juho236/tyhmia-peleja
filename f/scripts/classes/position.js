export class Vector2 {
    constructor(x,y) {
        this.X = x;
        this.Y = y;
    }

    add(v2) {
        return new Vector2(this.X + v2.X,this.Y + v2.Y);
    }
}
export class Scale2 {
    constructor(sx,ox,sy,oy) {
        this.scaleX = sx;
        this.offsetX = ox;
        this.scaleY = sy;
        this.offsetY = oy;
    }
}