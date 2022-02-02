/**
 * Quick and Dirty Parser
 */

import { ALexer, AMark, AToken } from "./alexer.js";
import assert from "./assert.js";
import { AssertionError } from "./err.js";

/** @typedef {function(...any): any} ProductionCallback */

/**
 * // lhs: name of the produced non-terminal. Must start with '#'.
 * @typedef {{
 *   lhs: string,
 *   rhs: string[],
 *   f?: ProductionCallback,
 *   throwOnFail?: boolean,
 * }} AGrammarRule
 */

/**
 * @interface
 */
export class AGrammar {
    /** @returns {string} */
    get start() { return assert.fail(); }

    /** @returns {AGrammarRule[]} */
    get rules() { return assert.fail(); }
}

/**
 * @typedef {{
 *   lexer?: ALexer,
 * }} AParserOptions
 */

/**
 * @typedef {{
 *   filename?: string,
 * }} AParserRuntimeOptions
 */

/** @typedef {{ok: boolean, value: any, i: number}} AParseResult */

/**
 * @typedef {{
 *   rules: AGrammarRule[]
 * }} ANonTerminalSpec
 */

export class AParser {

    /**
     * @param {AGrammar} grammar
     * @param {AParserOptions} [opts]
     */
    constructor(grammar, opts) {
        this._start = grammar.start;
        this._lexer = opts?.lexer || new ALexer();

        /** @type {Map<string, ANonTerminalSpec>} */
        const map = new Map();

        for (const rule of grammar.rules) {
            const lhs = rule.lhs;
            if (lhs.length === 0 || lhs[0] !== '#') {
                throw new AssertionError(
                    `Invalid nonterminal name ${lhs} ` +
                    `(must be non-empty and start with '#')`);
            }
            for (const symbol of rule.rhs) {
                if (symbol.length === 0) {
                    throw new AssertionError(
                        `Invalid symbol name ${symbol} ` +
                        `(must be non-empty)`);
                }
            }
            if (!rule.f && rule.rhs.length > 1) {
                throw new AssertionError(
                    `Production Callback may not be omitted if the pattern ` +
                    `has more than one symbol (${rule.lhs} <- ${rule.rhs})`);
            }
            if (!map.has(lhs)) {
                map.set(lhs, { rules: [] });
            }
            map.get(lhs)?.rules.push(rule);
        }

        this._map = map;

        if (!this._map.has(this._start)) {
            throw new AssertionError(
                `Start symbol ${this._start} is not a recognized nonterminal`);
        }
        for (const rule of grammar.rules) {
            for (const symbol of rule.rhs) {
                if (symbol[0] === '#') {
                    if (!this._map.has(symbol)) {
                        throw new AssertionError(
                            `No production rule for nonterminal ${symbol}`);
                    }
                } else if (!this._lexer.tokenTypes.has(symbol)) {
                    throw new AssertionError(`Unrecognized terminal symbol ${symbol}`);
                }
            }
        }
    }

    /**
     * @param {string} s
     * @param {AParserRuntimeOptions} [opts]
     * @returns {AParseResult}
     */
    parse(s, opts) {
        const ts = this._lexer.list(s, opts);

        /** @type {(Map<string, AParseResult> | undefined)[]} */
        const cache = Array(ts.length);

        /**
         * @param {string} symbol
         * @param {number} i
         * @returns {AParseResult}
         */
        const match = (symbol, i) => {
            if (symbol[0] === '#') {
                // non-terminal

                // == check the cache ==
                let cacheMap = cache[i];
                if (cacheMap === undefined) {
                    cacheMap = cache[i] = new Map();
                }
                const cacheResult = cacheMap.get(symbol);
                if (cacheResult !== undefined) {
                    return cacheResult;
                }

                // == compute without cache ==
                const spec = assert.defined(this._map.get(symbol));
                for (const rule of spec.rules) {
                    let j = i;
                    const values = [];
                    for (const part of rule.rhs) {
                        const { ok, value, i: k } = match(part, j);
                        if (!ok) {
                            if (rule.throwOnFail) {
                                throw new Error(
                                    `Failed to match ${rule.lhs} at ${ts[i].descriptor()} ` +
                                    `on line ${ts[i].mark.lineNumber}`);
                            }
                            break;
                        }
                        values.push(value);
                        j = k;
                    }
                    if (values.length === rule.rhs.length) {
                        const resultValue = (rule.f || (x => x))(...values);
                        const result = { ok: true, value: resultValue, i: j };
                        cacheMap.set(symbol, result);
                        return result;
                    }
                }
                const result = { ok: false, value: null, i: 0 };
                cacheMap.set(symbol, result);
                return result;
            } else {
                // terminal
                return ts[i].type === symbol ?
                    {
                        ok: true,
                        value: ts[i].value === undefined ? ts[i].type : ts[i].value,
                        i: i + 1,
                    } :
                    { ok: false, value: null, i: 0 };
            }
        };

        return match(this._start, 0);
    }

    /**
     * @param {string} s
     * @param {AParserRuntimeOptions} [opts]
     * @returns {any}
     */
    parseValue(s, opts) {
        const { ok, value } = this.parse(s, opts);
        if (!ok) {
            throw new AssertionError(`Parse Failed`);
        }
        return value;
    }
}
