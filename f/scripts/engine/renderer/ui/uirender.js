export const RenderLayer = (layer,t,dt) => {
    layer.layer.Draw.drawImage(layer.buffer.Buffer,0,0);
}