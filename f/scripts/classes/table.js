export class Table {
    constructor() {
        this.content = {};
    }
    clone() {
        const t = new Table();
        this.pairs((k,v) => { t.set(k,v); });

        return t;
    }
    length() {
        let l = 0;
        this.iterate(() => { l ++; });
        return l;
    }
    set(key,value) {
        this.content[key] = value;
    }
    insert(value) {
        let index = 0;
        while (true) {
            if (!this.content[index]) { this.content[index] = value; return index; }

            index ++;
        }
    }
    remove(value) {
        let index = 0;
        while (true) {
            const val = this.content[index];
            if (val == value) { this.content[index] = undefined; return index; }

            index ++;
        }
    }
    pairs(callback) {
        this.iterate((v,k) => { callback(k,v); });
    }
    iterate(callback) {
        Object.entries(this.content).map(v => {
            const value = v[1];
            if (!value) { return; }
            const key = v[0];

            callback(value,key);
        });
    }
}