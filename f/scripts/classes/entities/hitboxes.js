import { GetEntities } from "../../engine/tick/tick.js";
import { Vector2 } from "../position.js";
import { TextureEntityBase } from "./index.js";

class HitboxEntity extends TextureEntityBase {
    constructor(entity,size,offset,layer) {
        super(entity.pos,size,entity.Z,layer);

        this.offset = offset;
        this.attachment = entity;
        this.AI(0);
        this.preRender();
        this.prepareRender();
    }

    Activate(ft) {
        this.Active = ft;
    }
    AI(dt) {
        const normal = new Vector2(this.attachment.Direction,1);
        this.pos = this.attachment.pos.add(this.offset.multiplyV(normal));
        let ns = this.size.abs().multiplyV(normal);
        if (ns != this.size) {
            this.size = ns;
            this.changed = true;
        }

        if (!this.Active) { return; }
        this.Active -= dt;

        GetEntities().iterate(entity => {
            if (entity == this) { return; }
            if (!entity.health) { return; }
            if (entity == this.attachment) { return; }

            
        });

        if (this.Active > 0) { return; }
        this.Active = undefined;
    }
}
export class AnimatedHitboxEntity extends HitboxEntity {
    constructor(entity,size,offset,layer,textures,x,y,time) {
        super(entity,size,offset,layer);

        this.textureX = x;
        this.textureY = y;
        this.textures = textures;
        this.texture = textures[0];
        this.animationIndex = 0;
        this.ftime = 0;
        this.time = time / textures.length;
    }

    restart() {
        this.animationIndex = 0;
        this.ftime = 0;
    }
    draw(t,dt) {
        if (!this.texture) { return; }
        this.buffer.Draw.drawImage(this.texture,0,0);
    }
    AnimationStep(e,t,dt) {
        this.ftime += dt;
        if (this.ftime >= this.time) {
            this.animationIndex ++;
            this.texture = this.textures[this.animationIndex];

            this.ftime -= this.time;
        }
    }
}