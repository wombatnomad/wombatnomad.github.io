/**
 * Library for generating Bitmap files
 */

import { ArrayBufferBuilder } from "../stable/arraybufferbuilder.js";

export class Bitmap {
    /**
     * Constructs a new empty Bitmap
     * @param {number} width width of bitmap in pixels
     * @param {number} height height of bitmap in pixels
     */
    constructor(width, height) {
        this._width = width;
        this._height = height;

        /**
         * Pixel data stored as ARGB32 (little endian)
         */
        this._data = new Uint8Array(width * height * 4);
    }

    /**
     * @returns {number}
     */
    get width() {
        return this._width;
    }

    /**
     * @returns {number}
     */
    get height() {
        return this._height;
    }

    /**
     * @param {[number, number]} xy
     * @returns {number}
     */
    _index(xy) {
        const [x, y] = xy;
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
            throw new Error(`Invalid index XY=(${x},${y}), DIM=(${this._width},${this._height})`);
        }
        return (y * this._width + x) * 4;
    }

    /**
     * @param {[number, number]} xy
     * @param {[number, number, number] | [number, number, number, number]} rgba
     */
    setPixel(xy, rgba) {
        const i = this._index(xy);
        const [r, g, b, a] = rgba;
        this._data[i] = b;
        this._data[i + 1] = g;
        this._data[i + 2] = r;
        this._data[i + 3] = a === undefined ? 255 : a;
    }

    /**
     * @param {[number, number]} xy
     * @returns {[number, number, number, number]} a 4-tuple of RGBA pixel data
     */
    getPixel(xy) {
        const i = this._index(xy);
        const b = this._data[i];
        const g = this._data[i + 1];
        const r = this._data[i + 2];
        const a = this._data[i + 3];
        return [r, g, b, a];
    }

    /**
     * Encode this Bitmap into a BMP file.
     * You should be able to write the resulting Uint8Array into an file to
     * make a valid BMP file.
     * @returns {Uint8Array}
     */
    toBMPBytes() {
        // BMP file format reference:
        // https://en.wikipedia.org/wiki/BMP_file_format
        const b = new ArrayBufferBuilder();
        b.useLittleEndian();

        const fileHeaderSize = 14;
        const dibHeaderSize = 40;
        const pixelDataOffset = fileHeaderSize + dibHeaderSize;
        const fileSize = pixelDataOffset + this._data.length;

        // File header
        b.addUTF8('BM');
        b.addI32(fileSize);
        b.addU16(0); // reserved
        b.addU16(0); // reserved
        b.addI32(pixelDataOffset); // pixel data offset

        // DIB header (Windows BITMAPINFOHEADER)
        b.addI32(40); // size of the DIB header
        b.addI32(this._width); // size of width in pixels
        b.addI32(this._height); // size of height in pixels
        b.addU16(1); // number of color planes (must be 1)
        b.addU16(32); // number of bits per pixel
        b.addI32(0); // compression (no compression)
        b.addI32(0); // size of raw data (can be 0 if no compression used)
        b.addI32(2835); // pixels/metre horizontal
        b.addI32(2835); // pixels/metre vertical
        b.addI32(0); // number of color in palette (0 to default to 2**n)
        b.addI32(0); // "important colors" count (generally ignored)

        // ARGB32 (little-endian) pixel data
        b.addUint8Array(this._data);

        return b.toUint8Array();
    }
}
