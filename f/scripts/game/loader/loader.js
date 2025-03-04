import { Scale2, Vector2 } from "../../classes/position.js";
import { UIFrame, UIText } from "../../classes/ui/elements.js";
import { Colors, Sizes, UILayer } from "../../classes/ui/index.js";
import { Layers } from "../../engine/renderer/index.js";
import { Font } from "../../textures/fonts/fonts.js";

export const LoadLoader = () => {
    const ui = new UILayer(Layers.ui,99);
    const bg = new UIFrame(undefined,Sizes.Fullscreen,null,Colors.Transparent);
    const title = new UIText(new Scale2(.5,0,.25,0),new Scale2(1,0,0,18),new Vector2(.5,.5),Colors.White,"Loading...",Font.Standard,3);
    const desc = new UIText(new Scale2(.5,0,.5,0),new Scale2(1,0,0,12),new Vector2(.5,0),Colors.White,"",Font.Standard,2);

    bg.addChild(desc);
    bg.addChild(title);
    ui.addChild(bg);
    const setText = text => {
        console.log(text);
        desc.text = text;
    }

    return setText;
}