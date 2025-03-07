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