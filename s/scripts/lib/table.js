const table = {};

table.insert = (array, item) => {
    let index = 0;
    while (true) {
        let key = array[index];
        if (key) { index++; continue; }

        array[index] = item;
        return index;
    }
}
table.add = (array, item, index) => {
    let temp = item;
    while (true) {
        let key = array[index];
        array[index] = temp;
        temp = key;
        if (!key) { return index; }
        index ++;
    };
}

table.remove = (array, item) => {
    let index = 0;
    while (true) {
        let key = array[index];
        if (key === item) {
            array[index] = 0;
            return;
        }
        if (key != null) { index ++; continue; }
        return;
    }
}
table.length = array => {
    let l = 0;
    table.iterate(array, async key => {if (!key) { return; } l += 1;} );
    return l;
}

table.iterate = async (array, callback, startIndex) => {
    let index = startIndex || 0;
    while (true) {
        let key = array[index];
        if (key != null) {
            if (callback(key,index) == -1) { return; }
            index ++;
            continue;
        }
        return;
    };
}

export { table };