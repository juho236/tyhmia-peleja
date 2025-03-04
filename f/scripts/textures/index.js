import { FontInit, LoadFonts } from "./fonts/fonts.js"
import { LoadImages } from "./textures.js";


export const LoadInit = async () => {
    await FontInit();
}
export const LoadTextures = async loadText => {
    await LoadFonts(loadText);
    await LoadImages(loadText);
}

