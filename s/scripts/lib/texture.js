export const LoadTexture = async (path) => {
    const response = await fetch(path);

    const blob = await response.blob();
    return blob;
}
export const LoadTextures = async pathes => {
    let promise = new Promise(completed => {
        let list = {};
        let textures = 0;
        Object.entries(pathes).map(async path => {
            textures += 1;
            const blob = await LoadTexture(path[1]);

            textures -= 1;
            list[path[0]] = blob;
            if (textures > 0) { return; }
            completed(list);
        });
    });

    return await promise;
}
export const TextureBuffers = async (blobs, width, height) => {
    let promise = new Promise(completed => {
        let list = {};
        let textures = 0;
        Object.entries(blobs).map(async blob => {
            textures += 1;
            const buffer = await TextureBuffer(blob[1],width,height);

            textures -= 1;
            list[blob[0]] = buffer;
            if (textures > 0) { return; }

            list.flash = ColorCopy(list.default,255,255,255);
            completed(list);
        });
    });

    return await promise;
}

export const BlankBuffer = (width, height) => {
    const buffer = document.createElement("canvas");
    buffer.width = width;
    buffer.height = height;
    const ctx = buffer.getContext("2d");
    //ctx.imageSmoothingEnabled = false;

    return {Buffer: buffer, Draw: ctx};
}

const seturl = async (img,url) => {
    const p = new Promise(completed => {
        img.onload = completed;
        img.src = url;
    });

    await p;
}


export const ColorCopy = (buffer, r, g, b) => {
    if (!buffer) { return; }

    let w = buffer.Buffer.width;
    let h = buffer.Buffer.height;

    const imgData = buffer.Draw.getImageData(0,0,w,h);
    for (let p = 0; p < imgData.data.length; p += 4) {
        if (imgData.data[p + 3] <= 0) { continue; }
        imgData.data[p] = r;
        imgData.data[p + 1] = g;
        imgData.data[p + 2] = b;
        imgData.data[p + 3] = 255;
    }

    const copy = BlankBuffer(w,h);
    copy.Draw.putImageData(imgData,0,0);
    return copy;
}


export const TextureBuffer = async (blob, width, height) => {
    const buffer = BlankBuffer(width,height);
    const img = new Image(width,height);
    img.style.imageRendering = "pixelated";
    const url = window.URL.createObjectURL(blob);
    await seturl(img,url);

    buffer.Draw.drawImage(img,0,0,width,height);
    return buffer;
}