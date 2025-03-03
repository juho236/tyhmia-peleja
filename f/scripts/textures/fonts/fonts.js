import { FetchBlob, FetchRaw } from "../fetch/fetch.js";
import { ParseFontData } from "../fetch/fontdataparser.js";

export const Font = {
    Standard: {
        path: "standard.png",
        datapath: "standard.bin",
        name: "Font/Standard",
    }
}
const fontPath = "assets/fonts/";

export const FontInit = async () => {
    await LoadFont(Font.Standard);
}
const LoadFont = async (obj) => {
    if (obj.loaded) { return; }
    const img = await FetchBlob(fontPath + obj.path);
    const raw = await FetchRaw(fontPath + obj.datapath);

    const data = ParseFontData(raw);

    obj.image = img;
    obj.data = data;
    obj.loaded = true;
}
export const LoadFonts = async loadText => {
    for (const p in Font) {
        const v = Font[p];
        loadText(v.name);
        await LoadFont(v);
    }
}