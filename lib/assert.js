import * as cmp from './ops.js';
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
     * Checks that cmp.eq(a, b)
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static eq(a, b, message) {
        if (!cmp.eq(a, b)) {
            throw new AssertionError(
                `Expected ${a} to equal ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Like `eq` but uses the native '==='
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static xeq(a, b, message) {
        if (a !== b) {
            throw new AssertionError(
                `Expected ${a} === ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Checks that !cmp.eq(a, b)
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static neq(a, b, message) {
        if (cmp.eq(a, b)) {
            throw new AssertionError(
                `Expected ${a} to not equal ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Like `neq` but uses the native '==='
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static xneq(a, b, message) {
        if (a === b) {
            throw new AssertionError(
                `Expected ${a} !== ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Checks that cmp.lt(a, b)
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static lt(a, b, message) {
        if (!cmp.lt(a, b)) {
            throw new AssertionError(
                `Expected ${a} to be less than ${b}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Like `lt` but uses the native '<'
     * @param {any} a
     * @param {any} b
     * @param {string} [message]
     */
    static xlt(a, b, message) {
        if (!(a < b)) {
            throw new AssertionError(
                `Expected ${a} < ${b}: ${message || 'assertion failed'}`);
        }
    }
}
