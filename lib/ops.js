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

    if (a.equals) {
        return a.equals(b);
    }

    return a === b;
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
     * @param {Comparable} other
     * @returns {boolean}
     */
    lessThan(other) {
        return false;
    }
}

/**
 * @typedef {number | string | DataView | ExplicitLessThan} Comparable0
 */

/**
 * @typedef {Comparable0 | Comparable0[] } Comparable1
 */

/**
 * @typedef {Comparable1 | Comparable1[] } Comparable
 */

/**
 * Checks whether a is less than b.
 * Uses the 'lessThan' method if one exists,
 * has some special behavior for builtin types, and
 * falls back to '<' for others
 * @template {Comparable} C
 * @param {C} a
 * @param {C} b
 * @returns {boolean}
 */
export function lt(a, b) {
    if (typeof a !== 'object') {
        return a < b;
    }

    if (Array.isArray(a)) {
        if (Array.isArray(b)) {
            return arrayLt(a, b);
        }
        return false;
    }

    if (ArrayBuffer.isView(a)) {
        const au8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        if (ArrayBuffer.isView(b)) {
            const bu8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            return ltNumberArray(au8, bu8);
        }
        return false;
    }

    if (a.lessThan) {
        return a.lessThan(b);
    }

    return a < b;
}


/**
 * @param {Comparable[]} a
 * @param {Comparable[]} b
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
