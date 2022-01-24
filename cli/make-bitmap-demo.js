import { Bitmap } from "../lib/bmp.js";
import * as fs from "fs";


const H = 400;
const W = 400;
const bmp = new Bitmap(W, H);
for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
        if (x < W / 3) {
            bmp.setPixel([x, y], [255, 0, 0]);
        } else if (x < 2 * W / 3) {
            if (x < y) {
                bmp.setPixel([x, y], [0, 255, 0]);
            } else {
                bmp.setPixel([x, y], [255, 255, 0]);
            }
        } else {
            bmp.setPixel([x, y], [0, 0, 255]);
        }
    }
}
const array = bmp.toUint8Array();

fs.writeFileSync('out.bmp', array);
