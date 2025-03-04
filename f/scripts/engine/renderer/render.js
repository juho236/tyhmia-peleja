import { Table } from "../../classes/table.js";

export const RenderLayered = (itemlist,callback) => {
    const orderedList = new Table();
    
    let l = itemlist.length();

    const list = itemlist.clone();
    for (let i = 0;i < l;i++) {
        let smallest = Infinity;
        let value = undefined;
        list.iterate(v => {
            if (v.Z > smallest) { return; }
            smallest = v.Z;
            value = v;
        });

        list.remove(value);
        if (!value) { continue; }
        orderedList.insert(value);
    }

    orderedList.iterate(callback);
}