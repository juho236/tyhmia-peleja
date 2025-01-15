export class v2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new v2(this.x + v.x,this.y + v.y);
    }
}