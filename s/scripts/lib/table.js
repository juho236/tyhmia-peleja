const table = {};

table.insert = (array, item) => {
    let index = 0;
    while (true) {
        let key = array[index];
        if (key != null) { index++; continue; }

        array[index] = item;
        return index;
    }
}
table.remove = (array, item) => {
    let index = 0;
    while (true) {
        let key = array[index];
        if (key === item) {
            array[index] = null;
            return;
        }
        if (key != null) { index ++; continue; }
        return;
    }
}

export { table };