let savedata = {};

export const Load = async () => {
    let localstorage = window.localStorage;
    if (!localstorage) { return false; }

    try {
        let data = localstorage.getItem("save");
        
        savedata = JSON.parse(data) || {};
        savedata = {wave: 7, difficulty: 2, score: 75, upgrades: ["DamagePath"]}
        return savedata;
    } catch (err) {
        return false;
    }
}

export const SetSaveKey = (key,value) => {
    savedata[key] = value;
    try {
        window.localStorage.setItem("save",JSON.stringify(savedata));
    } catch (err) {
        console.error(err);
        alert("Please enable LocalStorage to save your game");
    }
}