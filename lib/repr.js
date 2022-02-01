

/**
 * @param {any} x
 * @returns {string}
 */
export function repr(x) {
    if (typeof x === 'string') {
        return JSON.stringify(x);
    }
    if (Array.isArray(x)) {
        return `[${x.map(repr).join(', ')}]`;
    }
    return '' + x;
}
