import * as cmp from './ops.js';
import { AssertionError, UnreachableError } from './err.js';
import { repr } from './repr.js';

export default class assert {

    /**
     * @template T
     * @param {T | undefined} x
     * @returns {T}
     */
    static defined(x) {
        if (x === undefined) {
            throw new AssertionError('value was unexpectedly not defined');
        }
        return x;
    }

    /**
     * @param {boolean} condition
     * @param {string} [message]
     */
    static that(condition, message) {
        if (!condition) {
            throw new AssertionError(message || 'assertion failed');
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
                `Expected ${repr(a)} to equal ${repr(b)}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Like `eq` but uses the native '==='
     * @template T
     * @param {T} a
     * @param {T} b
     * @param {string} [message]
     */
    static xeq(a, b, message) {
        if (a !== b) {
            throw new AssertionError(
                `Expected ${repr(a)} === ${repr(b)}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Checks that !cmp.eq(a, b)
     * @template T
     * @param {T} a
     * @param {T} b
     * @param {string} [message]
     */
    static neq(a, b, message) {
        if (cmp.eq(a, b)) {
            throw new AssertionError(
                `Expected ${repr(a)} to not equal ${repr(b)}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Like `neq` but uses the native '==='
     * @template T
     * @param {T} a
     * @param {T} b
     * @param {string} [message]
     */
    static xneq(a, b, message) {
        if (a === b) {
            throw new AssertionError(
                `Expected ${repr(a)} !== ${repr(b)}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Checks that cmp.lt(a, b)
     * @template {cmp.LessThan} T
     * @param {T} a
     * @param {T} b
     * @param {string} [message]
     */
    static lt(a, b, message) {
        if (!cmp.lt(a, b)) {
            throw new AssertionError(
                `Expected ${repr(a)} to be less than ${repr(b)}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * Like `lt` but uses the native '<'
     * @template {cmp.NativeComparable} T
     * @param {T} a
     * @param {T} b
     * @param {string} [message]
     */
    static xlt(a, b, message) {
        if (!(a < b)) {
            throw new AssertionError(
                `Expected ${repr(a)} < ${repr(b)}: ${message || 'assertion failed'}`);
        }
    }

    /**
     * @returns {never}
     */
    static fail() {
        throw new UnreachableError();
    }

    /**
     * @param {any} type
     * @param {function():void} f
     */
    static throws(type, f) {
        let thrown = false;
        try {
            f();
        } catch (e) {
            if (e instanceof type) {
                thrown = true;
            } else {
                throw new AssertionError(`Expected ${repr(type)} to be thrown but got ${repr(e)}`);
            }
        }
        if (!thrown) {
            throw new AssertionError(`Expected ${repr(type)} to be thrown but none was thrown`);
        }
    }
}
