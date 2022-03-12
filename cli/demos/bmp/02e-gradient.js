import { Bitmap } from "../../../lib/x/bmp.js";
import * as fs from "fs";


const H = 200;
const W = 200;
const bmp = new Bitmap(W, H);

for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
        const theta = Math.atan2(H / 2 - y, W / 2 - x);
        const radius = 255 * ((((H / 2 - y) / H) ** 2 + ((W / 2 - x) / W) ** 2) ** 0.5);
        const red = (1 - radius ** 2) * (Math.sin(theta / 2) + 1) / 2;
        const green = (1 - radius ** 2) * (Math.sin(theta / 2 * 3) + 1) / 2;
        const blue = (1 - radius ** 2) * (Math.sin(theta / 2 * 4) + 1) / 2;
        bmp.setPixel([x, y], [red, green, blue]);
    }
}

fs.writeFileSync('out.bmp', bmp.toBMPBytes());
