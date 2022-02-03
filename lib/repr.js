import { isPod } from "./ops.js";


/**
 * @param {any} x
 * @returns {string}
 */
export function repr(x) {
    if (typeof x === 'string') {
        return JSON.stringify(x);
    }
    if (typeof x === 'object') {
        if (Array.isArray(x)) {
            return `[${x.map(repr).join(', ')}]`;
        }
        if (isPod(x)) {
            return reprPod(x);
        }
        if (x !== null && x.toString && x.toString !== Object.prototype.toString) {
            return '' + x;
        }
    }
    if (typeof x === 'function') {
        return `<function ${x.name}>`;
    }
    return '' + x;
}

/**
 * @param {any} x
 * @returns {string}
 */
function reprPod(x) {
    const parts = [];
    for (const key in x) {
        parts.push(`${JSON.stringify(key)}: ${repr(x[key])}`);
    }
    return `{${parts.join(', ')}}`;
}
