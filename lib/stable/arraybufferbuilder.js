
/**
 * Like a StringBuilder, but for building an ArrayBuffer or Uint8Array
 */
export class ArrayBufferBuilder {
    constructor() {
        this._le = false;
        this._data = new Uint8Array(16);
        this._view = new DataView(this._data.buffer);
        this._i = 0;
    }

    /**
     * @param {number} itemSize 
     * @returns {number} the index to insert the item
     */
    _reserve(itemSize) {
        const index = this._i;
        const requiredSize = this._i + itemSize;
        if (this._data.length < requiredSize) {
            let newSize = this._data.length * 2;
            while (newSize < requiredSize) {
                newSize *= 2;
            }
            const oldArray = this._data;
            this._data = new Uint8Array(newSize);
            this._view = new DataView(this._data.buffer);
            this._data.set(oldArray);
        }
        this._i += itemSize;
        return index;
    }

    useLittleEndian() {
        this._le = true;
    }

    useBigEndian() {
        this._le = false;
    }

    /**
     * @param {string} string 
     */
    addUTF8(string) {
        const array = new TextEncoder().encode(string);
        return this.addUint8Array(array);
    }

    /**
     * @param {Uint8Array} array 
     */
    addUint8Array(array) {
        const i = this._reserve(array.byteLength);
        this._data.set(array, i);
        return i;
    }

    /**
     * @param {number} value 
     */
    addU8(value) {
        const i = this._reserve(1);
        this._view.setUint8(i, value);
        return i;
    }

    /**
     * @param {number} value 
     */
    addI8(value) {
        const i = this._reserve(1);
        this._view.setInt8(i, value);
        return i;
    }

    /**
     * @param {number} value 
     */
    addU16(value) {
        const i = this._reserve(2);
        this._view.setUint16(i, value, this._le);
        return i;
    }

    /**
     * @param {number} value 
     */
    addI16(value) {
        const i = this._reserve(2);
        this._view.setInt16(i, value, this._le);
        return i;
    }

    /**
     * @param {number} value 
     */
    addU32(value) {
        const i = this._reserve(4);
        this._view.setUint32(i, value, this._le);
        return i;
    }

    /**
     * @param {number} value 
     */
    addI32(value) {
        const i = this._reserve(4);
        this._view.setInt32(i, value, this._le);
        return i;
    }

    /**
     * @returns {Uint8Array}
     */
    toUint8Array() {
        const array = new Uint8Array(this._i);
        array.set(this._data.subarray(0, this._i));
        return array;
    }

    /**
     * @returns {ArrayBuffer}
     */
    toArrayBuffer() {
        return this.toUint8Array().buffer;
    }
}
