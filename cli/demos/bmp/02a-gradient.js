import { Bitmap } from "../../../lib/bmp.js";
import * as fs from "fs";


const H = 200;
const W = 200;
const D = H ** 0.5 + W ** 0.5;
const bmp = new Bitmap(W, H);

for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
        const theta = Math.atan2(H / 2 - y, W / 2 - x);
        const radius = 255 / D * (((H / 2 - y) ** 2 + (W / 2 - x) ** 2) ** 0.5);
        const red = radius * Math.sin(theta / 2);
        const green = radius * Math.sin(theta / 2 * 3);
        const blue = radius * Math.sin(theta / 2 * 4);
        bmp.setPixel([x, y], [red, green, blue]);
    }
}

fs.writeFileSync('out.bmp', bmp.toBMPBytes());
