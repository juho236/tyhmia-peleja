import { Load } from "./scripts/engine/frame.js";
import { Load as LoadGame } from "./scripts/game/index.js";
import { Load as LoadRenderer } from "./scripts/renderer/render.js";

async function main() {
    const canvas = document.getElementById("game");
    if (!canvas) { return; }

    const ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    await LoadGame();
    LoadRenderer(canvas, ctx);
    
    Load();
    console.log("Loaded");
}

main();