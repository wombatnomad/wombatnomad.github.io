


/**
 * Countes the number of times 'c' appears in 's'
 * @param {string} s string to search in
 * @param {string} c character to count occurrence of
 * @returns {number}
 */
export function countChar(s, c) {
    let ret = 0;
    for (let m of s) {
        ret += m === c ? 1 : 0;
    }
    return ret;
}
