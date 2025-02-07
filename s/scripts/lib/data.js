export const Load = async () => {
    let localstorage = window.localStorage;
    if (!localstorage) { return false; }

    try {
        let data = localstorage.getItem("save");
        return JSON.parse(data);
    } catch (err) {
        return false;
    }
}