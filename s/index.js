import { Load } from "./scripts/engine/frame.js";
import { Load as LoadGame } from "./scripts/game/index.js";
import { Load as LoadRenderer } from "./scripts/renderer/render.js";
import { Load as LoadData } from "./scripts/lib/data.js";

async function main() {
    const canvas = document.getElementById("game");
    if (!canvas) { return; }

    const ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    console.log("Start loading");
    let data = await LoadData();
    console.log(data);
    await LoadGame(data);
    LoadRenderer(canvas, ctx);
    
    Load();
    console.log("Loaded");
}

main();