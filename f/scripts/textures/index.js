import { FontInit, LoadFonts } from "./fonts/fonts.js"


export const LoadInit = async () => {
    await FontInit();
}
export const LoadTextures = async loadText => {
    await LoadFonts(loadText);
}

