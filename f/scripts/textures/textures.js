import { LoadTextureImage } from "./loader.js";

export const Textures = {
    World: {
        Ground0: "world/ground0.png",
        Ground0End: "world/ground0-end.png",
        Background0: "world/background0.png",
        Wall0: "world/wall0.png",
        Black: "world/black.png"
    },
    Player: {
        Temp: "player/temp.png"
    },
    Weapons: {
        Default: {
            Slash0: "weapons/slash_0.png",
            Slash1: "weapons/slash_1.png",
            Slash2: "weapons/slash_2.png",
            Slash3: "weapons/slash_3.png",
            Slash4: "weapons/slash_4.png",
            Slash5: "weapons/slash_5.png",
            Slash6: "weapons/slash_6.png",
            Slash7: "weapons/slash_7.png",
            Slash8: "weapons/slash_8.png",
        }
    },
    Editor: {
        Select: "editor/select.png",
        Move: "editor/move.png",
        Scale: "editor/scale.png",
        Rotate: "editor/rotate.png"
    }
}

const path = "assets/textures/";

const loop = async (l,loadText) => {
    for (const key in l) {
        const val = l[key];
        if (typeof val == "string") {
            loadText(val);
            const img = await LoadTextureImage(path + val);
            l[key] = img;
            continue;
        }

        await loop(val,loadText);
    }
}

export const LoadImages = async loadText => {
    await loop(Textures,loadText);
}