import { Bitmap } from "../../../lib/x/bmp.js";
import * as fs from "fs";


const H = 200;
const W = 200;
const bmp = new Bitmap(W, H);

for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
        bmp.setPixel([x, y], [255, 10, 128]);
    }
}

fs.writeFileSync('out.bmp', bmp.toBMPBytes());
