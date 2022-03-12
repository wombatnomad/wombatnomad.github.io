import { Bitmap } from "../../lib/x/bmp.js";
import { ImageSpec } from "../../lib/pixel-playground/img-spec.js";

console.log('start');
const W = 400;
const H = 400;

/** @type {HTMLImageElement} */
let img;

/** @type {HTMLTextAreaElement} */
let code;

/** @type {HTMLPreElement} */
let messages;

/** @type {HTMLButtonElement} */
let renderButton;

/** @type {HTMLButtonElement} */
let downloadButton;

window.onload = () => {
    messages = /** @type {HTMLPreElement} */ (document.getElementById('messages'));
    renderButton = /** @type {HTMLButtonElement} */ (document.getElementById('render-button'));
    downloadButton = /** @type {HTMLButtonElement} */ (document.getElementById('download-button'));
    code = /** @type {HTMLTextAreaElement} */ (document.getElementById('code'));
    img = /** @type {HTMLImageElement} */ (document.getElementById('img'));
    const bmp = new Bitmap(W, H);

    code.focus();

    renderButton.onclick = async () => {
        var exc = null;
        try {
            await updateAndRender();
        } catch (e) {
            exc = e;
        }
        if (exc) {
            messages.textContent = '' + exc;
        } else {
            messages.textContent = '';
        }
    };

    renderButton.click();
};

async function updateAndRender() {
    const spec = ImageSpec.fromSource(code.value || '');
    const bmp = spec.toBitmap();
    await updateImage(bmp);
}

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
        const link = 'data:image/bmp;base64,' + b64;
        downloadButton.onclick = () => {
            const a = document.createElement('a');
            a.href = link;
            a.download = 'image.bmp';
            a.click();
        };
        img.src = link;
        img.onload = function () { resolve(); };
        img.onerror = function (err) { reject(err); };
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
