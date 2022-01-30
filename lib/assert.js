import * as cmp from './cmp.js';
import { AssertionError } from './err.js';

export default class assert {
    /**
     * @param {boolean} condition
     * @param {string} message
     */
    static that(condition, message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }

    /**
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static eq(a, b, message) {
        if (!cmp.eq(a, b)) {
            throw new AssertionError(`Expected ${a} to equal ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static neq(a, b, message) {
        if (cmp.eq(a, b)) {
            throw new AssertionError(`Expected ${a} to not equal ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static lt(a, b, message) {
        if (!cmp.lt(a, b)) {
            throw new AssertionError(`Expected ${a} < ${b}: ${message || 'assertion failed'}`);
        }
    }

}
