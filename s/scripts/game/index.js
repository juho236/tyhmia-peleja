import { Load as LoadBackground } from "./background.js";
import { Load as LoadPlayer } from "./player.js";
import { Load as LoadScore } from "./score.js";
import { Load as LoadEnemies } from "./enemies.js";
import { Load as LoadDifficulty } from "./difficulty.js";
import { Load as LoadSettings } from "./settings.js";
import { GetSettings } from "../lib/data.js";
import { SetFramerate } from "../engine/frame.js";

export const Load = async savedata => {
    await LoadSettings();
    await LoadBackground(savedata);
    await LoadScore(savedata);

    LoadDifficulty(async () => {
        await LoadEnemies(savedata);
        await LoadPlayer(savedata);
    },savedata);

    let settings = GetSettings();
    SetFramerate(settings.fps);
}