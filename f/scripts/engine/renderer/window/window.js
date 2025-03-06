import { screenX, screenY } from "../../info.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

export const ClearMain = () => {
    ctx.clearRect(0,0,screenX,screenY);
}
export const DrawToMain = buffer => {
    ctx.drawImage(buffer.Buffer,0,0);
}
let globalScale = 1;
export const GetScale = () => { return globalScale; }
export const AdjustWindow = () => {
    let scaleX = window.innerWidth / screenX;
    let scaleY = window.innerHeight / screenY;

    let scale = Math.min(Math.floor(scaleX),Math.floor(scaleY));
    globalScale = scale;

    canvas.style.width = screenX * scale + "px";
    canvas.style.height = screenY * scale + "px";
}