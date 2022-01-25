import { Bitmap } from "../../../lib/bmp.js";
import * as fs from "fs";


const H = 200;
const W = 200;
const bmp = new Bitmap(W, H);

/** @type {[string, [number, number, number], [number, number]][]} */
const entries = [
    ['red', [255, 0, 0], [0, 0]],
    ['green', [0, 255, 0], [W / 2, 0]],
    ['blue', [0, 0, 255], [0, H / 2]],
    ['magenta', [255, 0, 255], [W / 2, H / 2]],
    ['celestial', [0xD0, 0xB3, 0x97], [W / 4, H / 4]],
];

for (const [_name, color, upperLeftCorner] of entries) {
    const [startX, startY] = upperLeftCorner;
    for (let x = startX; x < startX + W / 2; x++) {
        for (let y = startY; y < startY + H / 2; y++) {
            bmp.setPixel([x, y], color);
        }
    }
}

fs.writeFileSync('out.bmp', bmp.toBMPBytes());
