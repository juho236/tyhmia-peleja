let savedata = {};
let settingsdata = {};

export const Load = async () => {
    let localstorage = window.localStorage;
    if (!localstorage) { return false; }

    try {
        let data = localstorage.getItem("save");
        let settings = localstorage.getItem("settings");

        savedata = JSON.parse(data) || {};
        //savedata = {wave: 18, difficulty: 1, score: 0};

        //savedata.upgrades = ["UtilityPath","UtilityLaser","UtilityLaser1","UtilityLaserPower","DamagePath","DamageBasic","DamagePierce","DamagePierce1","DamagePierceSuper"]
        //savedata.upgrades = ["DamagePath","DamageBasic","DamageBasic1","DamageBasicSuper","DamagePierce","UtilityPath","UtilityLaser","UtilityLaser1","UtilityLaserSuper"];
        
        //savedata.upgrades = ["DefensePath","DefenseToughness","DefenseToughness1","DefenseToughnessPower","DefenseBasic"];
        //savedata.upgrades = ["DefensePath","DefenseBasic","DefenseBasic1","DefenseBasicSuper","DefenseToughness"];
        
        //savedata.upgrades = ["UtilityPath","UtilityLaser","UtilityLaser1","UtilityLaserPower","DefensePath","DefenseToughness","DefenseToughness1","DefenseToughnessPower","DefenseBasic"];

        //savedata.upgrades = ["DamagePath","DamageBasic","DamageBasic1","DamageBasicBasic","DamageSpeed","DefensePath","DefenseBasic","DefenseHealth","DefenseHealth1","DefenseHealthSuper"];
        //savedata.upgrades = ["UtilityPath","UtilitySpeed","UtilitySpeed1","UtilitySpeedPower","DefensePath","DefenseBasic","DefenseToughness","DefenseToughness1","DefenseToughnessBasic"];
        //savedata.upgrades = ["NoUpgrade0","NoUpgrade1","NoUpgrade2","NoUpgrade3","NoUpgrade4","NoUpgrade5","FinalUpgrade"];

        settingsdata = JSON.parse(settings) || {fps: 30};
        return savedata;
    } catch (err) {
        return false;
    }
}

export const NewGame = () => {
    if (window.localStorage) { window.localStorage.clear(); }
    window.location.reload();
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