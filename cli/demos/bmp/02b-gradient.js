import { Bitmap } from "../../../lib/bmp.js";
import * as fs from "fs";


const H = 200;
const W = 200;
const bmp = new Bitmap(W, H);

for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
        const theta = Math.atan2(H / 2 - y, W / 2 - x);
        const radius = 255;
        const red = radius * Math.sin(theta / 2);
        const green = radius * Math.sin(theta / 2 * 3);
        const blue = radius * Math.sin(theta / 2 * 4);
        bmp.setPixel([x, y], [red, green, blue]);
    }
}

fs.writeFileSync('out.bmp', bmp.toBMPBytes());
