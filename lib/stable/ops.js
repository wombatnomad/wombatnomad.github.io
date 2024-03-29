/**
 * @interface
 */
export class ExplicitEquals {
    /**
     * @param {any} other
     * @returns {boolean}
     */
    equals(other) {
        throw new Error("Not Implemented");
    }
}

/**
 * Checks whether two values are equal.
 * Uses the 'equals' method if one exists,
 * has some special behavior for builtin types, and
 * falls back to '===' for others
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function eq(a, b) {
    if (typeof a !== 'object') {
        return a === b;
    }

    if (Array.isArray(a)) {
        if (Array.isArray(b)) {
            return eqArray(a, b);
        }
        return false;
    }

    if (ArrayBuffer.isView(a)) {
        const au8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        if (ArrayBuffer.isView(b)) {
            const bu8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            return eqNumberArray(au8, bu8);
        }
    }

    if (a != null && a.equals) {
        return a.equals(b);
    }

    if (isPod(a) && isPod(b)) {
        return eqPod(a, b);
    }

    return a === b;
}

/**
 * @param {any} a
 * @returns {boolean}
 */
export function isPod(a) {
    if (!a) {
        return false;
    }
    const proto = Object.getPrototypeOf(a);
    return proto === null || proto === Object.prototype;
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function eqPod(a, b) {
    for (const key in a) {
        if (!Object.prototype.hasOwnProperty.apply(b, [key])) {
            return false;
        }
    }
    for (const key in b) {
        if (!Object.prototype.hasOwnProperty.apply(a, [key])) {
            return false;
        }
    }
    for (const key in a) {
        if (!eq(a[key], b[key])) {
            return false;
        }
    }
    return true;
}

/**
 * Compares two arrays
 * @param {any[]} a
 * @param {any[]} b
 * @returns {boolean}
 */
function eqArray(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!eq(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

/**
 * @param {ArrayLike<number>} a
 * @param {ArrayLike<number>} b
 * @returns {boolean}
 */
export function eqNumberArray(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * @interface ExplicitLessThan
 */
export class ExplicitLessThan {
    /**
     * @param {this} other
     * @returns {boolean}
     */
    lessThan(other) {
        return false;
    }
}

/**
 * @typedef {number | bigint | string} NativeComparable
 */

/**
 * @typedef {NativeComparable | DataView | ExplicitLessThan} LessThan0
 */

/**
 * @typedef {LessThan0 | LessThan0[] } LessThan1
 */

/**
 * @typedef {LessThan1 | LessThan1[] } LessThan
 */

/**
 * Checks whether a is less than b.
 * Uses the 'lessThan' method if one exists,
 * has some special behavior for builtin types, and
 * falls back to '<' for others
 * @template {LessThan} C
 * @param {C} a
 * @param {C} b
 * @returns {boolean}
 */
export function lt(a, b) {
    if (typeof a !== 'object' || typeof b !== 'object') {
        return a < b;
    }

    if (Array.isArray(a)) {
        if (Array.isArray(b)) {
            return arrayLt(a, b);
        }
        return false;
    }
    if (Array.isArray(b)) {
        throw new Error('lt mismatched types');
    }

    if (ArrayBuffer.isView(a)) {
        const au8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        if (ArrayBuffer.isView(b)) {
            const bu8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            return ltNumberArray(au8, bu8);
        }
        return false;
    }
    if (ArrayBuffer.isView(b)) {
        throw new Error('lt mismatched types');
    }

    if (a.lessThan) {
        return a.lessThan(b);
    }

    return a < b;
}


/**
 * @param {LessThan[]} a
 * @param {LessThan[]} b
 * @returns {boolean}
 */
function arrayLt(a, b) {
    const len = a.length < b.length ? a.length : b.length;
    for (let i = 0; i < len; i++) {
        if (lt(a[i], b[i])) {
            return true;
        } else if (lt(b[i], a[i])) {
            return false;
        }
    }
    return a.length < b.length;
}

/**
 * @param {ArrayLike<number>} a
 * @param {ArrayLike<number>} b
 * @returns {boolean}
 */
function ltNumberArray(a, b) {
    const len = a.length < b.length ? a.length : b.length;
    for (let i = 0; i < len; i++) {
        if (a[i] < b[i]) {
            return true;
        } else if (b[i] < a[i]) {
            return false;
        }
    }
    return a.length < b.length;
}
