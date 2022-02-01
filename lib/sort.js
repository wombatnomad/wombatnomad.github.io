/**
 * Some utilities for sorting elements.
 *
 * By default, it will use 'lt' from ops.js to do the comparison rather
 * than JavaScript's native '<'.
 */

import { lt } from "./ops.js";
/** @typedef {import("./ops.js").Comparable} Comparable */

/**
 * @typedef {{
 *  reverse?: boolean,
 *  useNativeComparison?: boolean,
 * }} SortOptions
 */

/**
 * @template {Comparable} C
 * @param {C[]} items
 * @param {SortOptions} [opts]
 * @returns {void}
 */
export function sort(items, opts) {
    items.sort(
        opts?.useNativeComparison ? (
            opts?.reverse ?
                ((b, a) => a < b ? -1 : b < a ? 1 : 0) :
                ((a, b) => a < b ? -1 : b < a ? 1 : 0)
        ) : (
            opts?.reverse ?
                ((b, a) => lt(a, b) ? -1 : lt(b, a) ? 1 : 0) :
                ((a, b) => lt(a, b) ? -1 : lt(b, a) ? 1 : 0)
        )
    );
}

/**
 * @template {Comparable} C
 * @param {Iterable<C>} items
 * @param {SortOptions} [opts]
 * @returns {C[]}
 */
export function sorted(items, opts) {
    const arr = Array.from(items);
    sort(arr, opts);
    return arr;
}

/**
 * @template C
 * @param {Iterable<C>} items
 * @returns {C[]}
 */
export function reversed(items) {
    const arr = Array.from(items);
    arr.reverse();
    return arr;
}
