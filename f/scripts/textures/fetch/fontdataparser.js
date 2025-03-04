const metadataOrder = ["scaleX","scaleY"];
const metadataType = [Number,Number];

const dataOrder = ["tileX","tileY","offsetX","offsetY"];
const dataType = [Number,Number,Number,Number];

export const ParseFontData = raw => {
    const metadata = [];
    const data = {};

    let meta = true;
    let l = raw.length;

    let phase = "Value";
    let value = "";
    let key = "";

    const save = () => {
        if (meta) {
            metadata.push(value);
            value = "";
            return;
        }

        if (phase == "Key") {
            key = key.charAt(key.length - 1);
            data[key] = [];
            return;
        }

        data[key].push(value);
        value = "";
    }

    for (let i=0;i<l;i++) {
        const char = raw.charAt(i);

        if (char == ":") {
            save();
            phase = "Value";
            continue;
        } else if (char == ";") {
            save();
            phase = "Key";
            key = "";
            meta = false;
            continue;
        }

        switch (phase) {
            case "Value": {
                value = value + char;
                break;
            }
            case "Key": {
                key = key + char;
                break;
            }
        }
    }

    const obj = {
        Meta: {},
        Characters: {}
    };

    for (let i=0;i<metadata.length;i++) {
        obj.Meta[metadataOrder[i]] = metadataType[i](metadata[i]);
    }
    Object.entries(data).map(v => {
        const l = {};
        for (let i=0;i<v[1].length;i++) {
            l[dataOrder[i]] = dataType[i](v[1][i]);
        }

        obj.Characters[v[0]] = l;
    });

    return obj;
}