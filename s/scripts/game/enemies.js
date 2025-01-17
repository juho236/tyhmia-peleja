import { Add, Remove } from "../engine/frame.js";
import { ClampAngle, entity, v2 } from "../lib/classes.js";
import { table } from "../lib/table.js";
import { LoadTextures, TextureBuffers } from "../lib/texture.js";
import { Layers, height } from "../renderer/render.js";

let waveIndex = 0;

let waves = [
    {pattern: [
        //{id: "wait",time: 5},
        {id: "enemy",enemy: "smallmeteor",count: 4,time: 5},
    ]}
]
waves.map(wave => {wave.pattern.push({id: "waitAll"})});

const parts = {
    wait: async obj => {
        await new Promise(complete => {
            let t = obj.time;
            const e = Add(dt => {t -= dt; if (t > 0) { return; } Remove(e); complete(); });
        });
    },
    enemy: async obj => {
        for (let i=0; i < obj.count; i ++) {
            spawnEnemy(obj.enemy);
            await parts.wait(obj);
        }
    },
    waitAll: async obj => {
        await new Promise(complete => {
            const e = Add(dt => {if (enemyCount > 0) { return; } Remove(e); complete(); });
        });
    }
};

let enemyCount = 0;
let enemies = {
    smallmeteor: {
        textures: {default: "assets/meteor-small1.png", tiny: "assets/meteor-tiny1.png"},
        width: 16,
        height: 16,
        size: new v2(16,16),
        hitbox: new v2(14,14),
        health: 3,
        ai: (e,dt) => {
            e.trot = ClampAngle(e.trot + dt);
            const u = player.pos.sub(e.pos).unit();
            e.velocity = e.velocity.add(new v2(u.x,u.y).multiply(dt * 20));
        },
        died: e => {

        }
    }
}

const spawnEnemy = id => {
    enemyCount += 1;
    const enemy = enemies[id];
    if (!enemy) { return; }

    let e = new entity("Enemy",enemy.size,enemy.hitbox,Layers.Enemies,enemy.textures);
    e.group = "Enemy";
    e.health = enemy.health;
    e.texture = enemy.textures.default;

    e.died = () => { enemy.died(e); }
    e.event = Add(dt => {
        enemy.ai(e,dt);
        e.frame(dt);
        e.render();
    });
}


const wavePart = async (pattern,index) => {
    const part = pattern[index];

    if (!part) { return; }

    await parts[part.id](part);
    await wavePart(pattern,index + 1);
}
const spawnWave = async index => {
    const wave = waves[index];

    if (wave.Checkpoint) { waveIndex = index; }
    await wavePart(wave.pattern,0);
    spawnWave(index + 1);
}

let player;
export const SetPlayer = plr => {
    player = plr;
}

export const LoadWave = () => {
    spawnWave(waveIndex);
}

export const Load = async () => {
    let promise = new Promise(completed => {
        let textures = 0;
        Object.entries(enemies).map(async i => {
            const enemy = i[1];
            textures += 1;
            enemy.textures = await TextureBuffers(await LoadTextures(enemy.textures),enemy.width,enemy.height);
            textures -= 1;
            if (textures > 0) { return; }
            completed();
        });
    });

    await promise;
}