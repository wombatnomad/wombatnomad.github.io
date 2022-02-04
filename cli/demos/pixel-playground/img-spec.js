import { ImageSpec } from "../../../lib/pixel-playground/img-spec.js";
import * as fs from "fs";


const bmp = ImageSpec.fromSource(`
bg 100 100 20
`).toBitmap();
fs.writeFileSync('out.bmp', bmp.toBMPBytes());

fs.writeFileSync('out2.bmp', ImageSpec.fromSource(`
bg 255 255 20
`).toBitmap().toBMPBytes());

fs.writeFileSync('out3.bmp', ImageSpec.fromSource(`
bg 255 255 20
fg 20 20 20
eq y = x * x
eq y < 0
`).toBitmap().toBMPBytes());
