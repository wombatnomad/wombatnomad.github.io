import { Bitmap } from "../../lib/bmp.js";

console.log('start');
const W = 400;
const H = 400;

/** @type {HTMLImageElement} */
let img;

/** @type {Bitmap} */
let bmp;

/** @type {HTMLTextAreaElement} */
let code;

window.onload = () => {
    code = /** @type {HTMLTextAreaElement} */ (document.getElementById('code'));
    img = /** @type {HTMLImageElement} */ (document.getElementById('img'));
    bmp = new Bitmap(W, H);

    code.focus();
    for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
            bmp.setPixel([x, y], [100, 100, 20]);
        }
    }
    updateImage(bmp);
};

/**
 * @param {Bitmap} bmp
 */
async function updateImage(bmp) {
    const b64 = await base64(bmp.toBMPBytes());
    await updateImageWithBase64Data(b64);
}

/**
 * @param {string} b64
 * @returns {Promise<void>}
 */
function updateImageWithBase64Data(b64) {
    return new Promise((resolve, reject) => {
        img.src = 'data:image/bmp;base64,' + b64;
        img.onload = function () { resolve(); };
        img.onerror = function () { resolve(); };
    });
}

/**
 * Reference: https://stackoverflow.com/a/66046176
 * @param {ArrayBufferView} view
 */
async function base64(view) {
    const data = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);

    /** @type {string} */
    const base64URL = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function () {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(`Unexpected result type ${reader.result}`);
            }
        };
        reader.onerror = function (err) {
            reject(err);
        };
        reader.readAsDataURL(new Blob([data]));
    });

    // The result looks like
    // "data:application/octet-stream;base64,<your base64 data>",
    // so we split off the beginning:
    return base64URL.split(',', 2)[1];
}
