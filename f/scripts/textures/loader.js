import { FetchBlob } from "./fetch/fetch.js";

export const LoadTextureImage = async (src) => {
    const blob = await FetchBlob(src);
    const img = document.createElement("img");
    img.style.imageRendering = "pixelated";
    const url = window.URL.createObjectURL(blob);
    await new Promise(completed => {
        img.onload = completed;
        img.src = url;
    });

    return img;
}