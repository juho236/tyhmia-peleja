import { Load as LoadBackground } from "./background.js";
import { Load as LoadPlayer } from "./player.js";
import { Load as LoadScore } from "./score.js";
import { Load as LoadEnemies } from "./enemies.js";

export const Load = async () => {
    await LoadBackground();
    await LoadEnemies();
    await LoadScore();
    await LoadPlayer();
}