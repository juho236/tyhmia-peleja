import { LoadTextureImage } from "./loader.js";

export const Textures = {
    World: {
        Ground0: "world/ground0.png",
        Background0: "world/background0.png"
    },
    Player: {
        Temp: "player/temp.png"
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