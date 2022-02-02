import assert from "./assert.js";
import { UnreachableError } from "./err.js";
import { repr } from "./repr.js";
import { sorted } from "./sort.js";


const DEFAULT_FILENAME = '<unknown>';
const DEFAULT_KEYWORDS = ['for', 'class', 'while', 'true', 'false'];
const DEFAULT_SYMBOLS = ['[', ']', '(', ')', '{', '}', '+', '-', '*', '/', '=', ';', ','];

/**
 * @typedef {{
 *  lexer: ALexer,
 *  filename: string,
 *  lastIndex: number,
 *  text: string,
 * }} State
 */

/**
 * @typedef {{
 *  re: RegExp,
 *  cb: function(State): AToken[]
 * }} Spec
 */

/** @type {Spec[]} */
const BASE_SPECS = [
    {
        // whitespace
        re: /[ \t\r]+/,
        cb: () => [],
    },
    {
        // newlines
        re: /\n+/,
        cb: s => [new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_NEWLINE)],
    },
    {
        // identifiers
        re: /[a-zA-Z_][a-zA-Z0-9_]*/,
        cb: s => [
            s.lexer._keywords.has(s.text) ?
                new AToken(s.filename, s.lastIndex, s.text) :
                new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_IDENT, s.text),
        ],
    },
    {
        // hex literal
        re: /0x[0-9a-fA-F]+/,
        cb: s => [new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_NUMBER, parseInt(s.text, 16))],
    },
    {
        // base 10 number with explicit '.'
        re: /[0-9]*\.[0-9]+(?:e(?:\+|-)?\d+)?/,
        cb: s => [new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_NUMBER, parseFloat(s.text))],
    },
    {
        // base 10 number without explicit '.'
        re: /[0-9]+(?:e(?:\+|-)?\d+)?/,
        cb: s => [new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_NUMBER, parseFloat(s.text))],
    },
    {
        // string literal with double quotes
        re: /\"(?:\\\"|[^"])*\"/,
        cb: s => [new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_STRING, eval(s.text))],
    },
    {
        // string literal with single quotes
        re: /\'(?:\\\'|[^'])*\'/,
        cb: s => [new AToken(s.filename, s.lastIndex, ATOKEN_TYPE_STRING, eval(s.text))],
    },
];

export const ATOKEN_TYPE_NEWLINE = '@NEWLINE';
export const ATOKEN_TYPE_STRING = '@STRING';
export const ATOKEN_TYPE_NUMBER = '@NUMBER';
export const ATOKEN_TYPE_IDENT = '@IDENT';
export const ATOKEN_TYPE_EOF = '@EOF';

/**
 * @typedef {{
 *   filename?: string
 *   keywords?: string[]
 *   symbols?: string[]
 * }} ALexerOptions
 */

class AToken {
    /**
     * @param {string} filename
     * @param {number} index
     * @param {string} type
     * @param {string | number} [value]
     */
    constructor(filename, index, type, value) {
        /** @type {string} */ this.filename = filename;
        /** @type {number} */ this.index = index;
        /** @type {string} */ this.type = type;
        /** @type {string | number | undefined} */ this.value = value;
    }

    toString() {
        return `AToken(.., ${repr(this.type)}, ${repr(this.value)})`;
    }
}

/**
 * A general purpose lexical analyzer.
 * Convenient for some quick hack projects where you may want to
 * parse some text
 */
export class ALexer {
    /**
     * @param {ALexerOptions} [opts]
     */
    constructor(opts) {
        const symbols = sorted(opts?.symbols || DEFAULT_SYMBOLS, { reverse: true });
        const specs = Array.from(BASE_SPECS);

        // add symbol pattern
        specs.push({
            re: new RegExp(symbols.map(regexpEscape).join('|')),
            cb: s => [new AToken(s.filename, s.lastIndex, s.text)],
        });

        // catch-all error pattern
        specs.push({
            re: /.\S*/,
            cb: s => { throw new Error(`Unrecognized token ${s.text}`); }
        });

        /** @type {string} */
        this._filename = opts?.filename || DEFAULT_FILENAME;

        /** @type {Set<string>} */
        this._keywords = new Set(opts?.keywords || DEFAULT_KEYWORDS);

        /** @type {Spec[]} */
        this._specs = specs;

        /** @type {RegExp} */
        this._re = new RegExp(this._specs.map(d => `(${d.re.source})`).join('|'), 'g');
    }

    /**
     * @param {string} s
     * @returns {Generator<AToken>}
     */
    *lex(s) {
        const state = {
            lexer: this,
            filename: this._filename,
            lastIndex: 0,
            text: '',
        };
        const re = new RegExp(this._re, 'g');

        while (re.lastIndex < s.length) {
            state.lastIndex = re.lastIndex;
            const results = re.exec(s);
            if (results === null) {
                throw new UnreachableError();
            }
            let resultIndex = 0;
            for (let i = 1; i < results.length; i++) {
                if (results[i] !== undefined) {
                    resultIndex = i;
                    break;
                }
            }
            state.text = results[resultIndex];
            resultIndex--;
            const callback = this._specs[resultIndex].cb;
            yield* callback(state);
        }

        yield new AToken(this._filename, s.length, ATOKEN_TYPE_EOF);
    }

    /**
     * @param {string} s
     * @returns {AToken[]}
     */
    list(s) {
        return Array.from(this.lex(s));
    }
}


/**
 * From https://stackoverflow.com/a/30851002
 * @param {string} literal
 * @returns {string}
 */
function regexpEscape(literal) {
    return literal.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}
