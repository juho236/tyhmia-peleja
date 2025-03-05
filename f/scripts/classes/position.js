export class Vector2 {
    constructor(x,y) {
        this.X = x;
        this.Y = y;
    }

    add(v2) {
        return new Vector2(this.X + v2.X,this.Y + v2.Y);
    }
    sub(v2) {
        return new Vector2(this.X - v2.X,this.Y - v2.Y);
    }

    lerp(v2,t) {
        return new Vector2(this.X + (v2.X - this.X) * t,this.Y + (v2.Y - this.Y) * t);
    }
}
export class Vector3 {
    constructor(x,y,z) {
        this.X = x;
        this.Y = y;
        this.Z = z;
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