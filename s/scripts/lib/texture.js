export const LoadTexture = async (path) => {
    const response = await fetch(path);

    const blob = await response.blob();
    return blob;
}

export const BlankBuffer = (width, height) => {
    const buffer = document.createElement("canvas");
    buffer.width = width;
    buffer.height = height;
    const ctx = buffer.getContext("2d");

    return {Buffer: buffer, Draw: ctx};
}

const seturl = async (img,url) => {
    const p = new Promise(completed => {
        img.onload = completed;
        img.src = url;
    });

    await p;
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