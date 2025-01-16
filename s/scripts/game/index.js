import { Load as LoadBackground } from "./background.js";
import { Load as LoadPlayer } from "./player.js";

export const Load = async () => {
    await LoadBackground();
    await LoadPlayer();
}