let savedata = {};
let settingsdata = {};

export const Load = async () => {
    let localstorage = window.localStorage;
    if (!localstorage) { return false; }

    try {
        let data = localstorage.getItem("save");
        let settings = localstorage.getItem("settings");

        savedata = JSON.parse(data) || {};
        savedata = {wave: 9, difficulty: 0, score: 0};

        //savedata.upgrades = ["UtilityPath","UtilityLaser","UtilityLaser1","UtilityLaserPower","DamagePath","DamageBasic","DamagePierce","DamagePierce1","DamagePierceSuper"]
        //savedata.upgrades = ["DamagePath","DamageBasic","DamageBasic1","DamageBasicSuper","DamagePierce","UtilityPath","UtilityLaser","UtilityLaser1","UtilityLaserPower"];
        //savedata.upgrades = ["DefensePath","DefenseBasic","DefenseBasic1","DefenseBasicSuper","DefenseToughness"];

        settingsdata = JSON.parse(settings) || {fps: 30};
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
export const SetSettingsKey = (key,value) => {
    settingsdata[key] = value;
    try {
        window.localStorage.setItem("settings",JSON.stringify(settingsdata));
    } catch (err) {
        console.error(err);
        alert("Please enable LocalStorage to save your game");
    }
}
export const GetSettings = () => {
    return settingsdata;
}