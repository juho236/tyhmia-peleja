import { Load as LoadBackground } from "./background.js";
import { Load as LoadPlayer } from "./player.js";
import { Load as LoadScore } from "./score.js";
import { Load as LoadEnemies } from "./enemies.js";
import { Load as LoadDifficulty } from "./difficulty.js";

export const Load = async () => {
    await LoadBackground();
    await LoadScore();

    new Promise(async completed => {
        await LoadDifficulty(async () => {
            await LoadEnemies();
            await LoadPlayer();
            completed();
        });
    });
}