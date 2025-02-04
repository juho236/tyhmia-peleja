import { table } from "./table.js"

export const weightCheck = obj => {
    let total = 0;
    let opts = [];
    let c = 0;
    table.pairs(obj,(index,item) => {
        if (!item) { return; }
        item.weight++;
        let w = item.weight;
        if (w <= 0) { return; }
        total += w;
        c ++;
        table.insert(opts,item);
    });
    if (total <= 0) { return; }
    if (c == 1) { return opts[0]; }
    
    let d = 0;
    let n = Math.floor(Math.random() * total);
    let v = 0;
    table.iterate(opts,item => {
        d += item.weight;
        if (n < d) { item.weight = 0; v = item; return -1; }

        item.weight ++;
    });

    return v;
}