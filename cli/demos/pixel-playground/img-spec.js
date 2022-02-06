import { ImageSpec } from "../../../lib/pixel-playground/img-spec.js";
import * as fs from "fs";


fs.writeFileSync('out01.bmp', ImageSpec.fromSource(`
fill [100, 100, 20]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out02.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out03.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
interpolation tolerance
draw y = x * x
draw y < 0
`).toBitmap().toBMPBytes());

fs.writeFileSync('out04.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
interpolation tolerance
draw y = x * x
draw y < 0
`).toBitmap().toBMPBytes());

fs.writeFileSync('out05.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw x * x + y * y <= 100
`).toBitmap().toBMPBytes());

fs.writeFileSync('out06.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw and[
    x ** 2 + y ** 2 <= 100 ** 2,
    y > 0
]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out07.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw or[
    x ** 2 + y ** 2 <= 10 ** 2,
    x ** 2 + y ** 2 > 100 ** 2
]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out08.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw and[
    x ** 2 + y ** 2 <= 100 ** 2,
    y > x,
    y > -x,
]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out09.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw y = 100 * sin(x / 100)
`).toBitmap().toBMPBytes());

fs.writeFileSync('out10.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw y % 7 = x % 4
`).toBitmap().toBMPBytes());

fs.writeFileSync('out11.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw y % 7 = x % 4
color [120, 120, 20]
draw y % 7 = (-x) % 4
`).toBitmap().toBMPBytes());

fs.writeFileSync('out12.bmp', ImageSpec.fromSource(`
fill [255, 255, 20]
color [20, 20, 20]
draw y % 110 = 100 * sin(x / 100)
`).toBitmap().toBMPBytes());

fs.writeFileSync('out13.bmp', ImageSpec.fromSource(`
fill [abs(x), 10, 10]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out14.bmp', ImageSpec.fromSource(`
fill [abs(x), abs(y), 10]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out15.bmp', ImageSpec.fromSource(`
fill [abs(x), abs(y), abs(x + y)]
`).toBitmap().toBMPBytes());

fs.writeFileSync('out16.bmp', ImageSpec.fromSource(`
color [50, 50, 50]
draw y = 0
draw x = 0
color [abs(100 - x), abs(-100 + y), 100]
draw y = 100 * sin(x / 100)
`).toBitmap().toBMPBytes());
