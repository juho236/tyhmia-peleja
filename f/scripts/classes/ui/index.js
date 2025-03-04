import { screenX, screenY } from "../../engine/info.js";
import { CreateBlankBuffer } from "../../engine/renderer/buffer/buffer.js";

export class UILayer {
    constructor(layer,z) {
        this.Z = z;
        this.buffer = CreateBlankBuffer(screenX,screenY);
        layer.Items.insert(this);
    }

    render(t,dt) {

    }
}