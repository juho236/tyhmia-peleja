import { TicksInit } from "./scripts/engine/tick/index.js";
import { LoadLoader } from "./scripts/game/loader/loader.js";
import { LoadInit, LoadTextures } from "./scripts/textures/index.js";

const main = async () => {
    await LoadInit();
    const loader = LoadLoader();
    await LoadTextures(loader);

    TicksInit();
}

main();