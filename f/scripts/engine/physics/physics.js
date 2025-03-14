import { Vector2 } from "../../classes/position.js";
import { GetEntities } from "../tick/tick.js";

const findWalls = (entity) => {
    const ret = {Left: Infinity,Right: Infinity,Up: Infinity,Down: Infinity};
    const entities = GetEntities();
    if (!entities) { return ret; }

    entities.iterate(obj => {
        if (!obj.object) { return; }
        if (!obj.collision) { return; }

        const xdiff = Math.abs(entity.pos.X - obj.pos.X) - Math.abs(entity.size.X) / 2 - Math.abs(obj.size.X) / 2;
        const ydiff = Math.abs(entity.pos.Y - obj.pos.Y) - Math.abs(entity.size.Y) / 2 - Math.abs(obj.size.Y) / 2;
        
        if (ydiff < 0) {
            if (entity.pos.X > obj.pos.X) {
                ret.Left = Math.min(ret.Left,xdiff);
            } else {
                ret.Right = Math.min(ret.Right,xdiff);
            }
        }
        if (xdiff < 0) {
            if (entity.pos.Y < obj.pos.Y) {
                ret.Down = Math.min(ret.Down,ydiff);
            } else {
                ret.Up = Math.min(ret.Up,ydiff);
            }
        }
    });

    return ret;
}


export const StepPhysics = (entity,dt) => {
    const walls = findWalls(entity);

    entity.pos = new Vector2(entity.pos.X,entity.pos.Y);
    let vel = entity.velocity;
    
    if (entity.onground <= 0) { vel.Y += entity.gravity * dt; }
    if (entity.knockbackX) {
        vel = new Vector2(entity.knockbackX,0);

        entity.knockbackTimer -= dt;
        if (entity.knockbackTimer <= 0) { entity.knockbackX = undefined; }
    }

    if (walls) {
        if (vel.X > 0) {
            if (vel.X * dt < walls.Right) {
                entity.pos.X += vel.X * dt;
            } else {
                entity.pos.X += walls.Right;
            }
        } else {
            if (-vel.X * dt < walls.Left) {
                entity.pos.X += vel.X * dt;
            } else {
                entity.pos.X -= walls.Left;
            }
        }
        
        if (vel.Y >= 0) {
            if (vel.Y * dt < walls.Down) {
                entity.pos.Y += vel.Y * dt;
                entity.onground -= dt;
            } else {
                entity.pos.Y += walls.Down;
                entity.onground = 0.1;
                vel.Y = 0;
            }
        } else {
            if (-vel.Y * dt < walls.Up) {
                entity.pos.Y += vel.Y * dt;
                entity.onground -= dt;
            } else {
                entity.pos.Y += walls.Up;
                vel.Y = 0;
            }
        }
    }

    entity.velocity = vel;
}