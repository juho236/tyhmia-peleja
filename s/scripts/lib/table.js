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

table.iterate = (array, callback) => {
    let index = 0;
    while (true) {
        let key = array[index];
        if (key != null) {
            callback(key);
            index ++;
            continue;
        }
        return;
    };
}

export { table };