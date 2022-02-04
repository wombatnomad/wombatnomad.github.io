import assert from "./assert.js";
import { UnreachableError } from "./err.js";
import { repr } from "./repr.js";
import { sorted } from "./sort.js";
import { countChar } from "./string-utils.js";


const DEFAULT_FILENAME = '<unknown>';
const DEFAULT_KEYWORDS = ['for', 'class', 'while', 'true', 'false'];
const DEFAULT_SYMBOLS = ['[', ']', '(', ')', '{', '}', '+', '-', '*', '/', '=', '<', '>', '<=', '>=', ';', ','];

/**
 * @typedef {{
 *  lexer: ALexer,
 *   mark: AMark,
 *  text: string,
 * }} State
 */

/**
 * @typedef {{
 *  re: RegExp,
 *  f: function(State): AToken[]
 * }} Spec
 */

/** @type {Spec[]} */
const BASE_SPECS = [
    {
        // whitespace
        re: /[ \t\r]+/,
        f: () => [],
    },
    {
        // newlines
        re: /\n+/,
        f: s => [new AToken(s.mark, ATOKEN_TYPE_NEWLINE)],
    },
    {
        // identifiers
        re: /[a-zA-Z_][a-zA-Z0-9_]*/,
        f: s => [
            s.lexer._keywords.has(s.text) ?
                new AToken(s.mark, s.text) :
                new AToken(s.mark, ATOKEN_TYPE_NAME, s.text),
        ],
    },
    {
        // hex literal
        re: /0x[0-9a-fA-F]+/,
        f: s => [new AToken(s.mark, ATOKEN_TYPE_NUMBER, parseInt(s.text, 16))],
    },
    {
        // base 10 number with explicit '.'
        re: /[0-9]*\.[0-9]+(?:e(?:\+|-)?\d+)?/,
        f: s => [new AToken(s.mark, ATOKEN_TYPE_NUMBER, parseFloat(s.text))],
    },
    {
        // base 10 number without explicit '.'
        re: /[0-9]+(?:e(?:\+|-)?\d+)?/,
        f: s => [new AToken(s.mark, ATOKEN_TYPE_NUMBER, parseFloat(s.text))],
    },
    {
        // string literal with double quotes
        re: /\"(?:\\\"|[^"])*\"/,
        f: s => [new AToken(s.mark, ATOKEN_TYPE_STRING, eval(s.text))],
    },
    {
        // string literal with single quotes
        re: /\'(?:\\\'|[^'])*\'/,
        f: s => [new AToken(s.mark, ATOKEN_TYPE_STRING, eval(s.text))],
    },
];

export const ATOKEN_TYPE_NEWLINE = 'NEWLINE';
export const ATOKEN_TYPE_STRING = 'STRING';
export const ATOKEN_TYPE_NUMBER = 'NUMBER';
export const ATOKEN_TYPE_NAME = 'NAME';
export const ATOKEN_TYPE_EOF = 'EOF';

/** @interface */
export class AMark {
    /** @returns {string} */
    get filename() { return assert.fail(); }

    /** @returns {number} */
    get mainIndex() { return assert.fail(); }

    /** @returns {number} */
    get startIndex() { return assert.fail(); }

    /** @returns {number} */
    get endIndex() { return assert.fail(); }

    /** @returns {number} */
    get lineNumber() { return assert.fail(); }
}

export class AToken {
    /**
     * @param {AMark} mark
     * @param {string} type
     * @param {string | number} [value]
     */
    constructor(mark, type, value) {
        /** @type {AMark} */ this.mark = mark;
        /** @type {string} */ this.type = type;
        /** @type {string | number | undefined} */ this.value = value;
    }

    toString() {
        return `AToken(.., ${repr(this.type)}, ${repr(this.value)})`;
    }

    descriptor() {
        return this.value === undefined ? this.type : `${this.type}(${repr(this.value)})`;
    }
}

/**
 * @typedef {{
 *   keywords?: string[]
 *   symbols?: string[]
 *   newlineBehavior?: 'keep' | 'ignore'
 * }} ALexerOptions
 */

/**
 * @typedef {{
 *   filename?: string
 * }} ALexerRuntimeOptions
 */

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
            f: s => [new AToken(s.mark, s.text)],
        });

        // catch-all error pattern
        specs.push({
            re: /.\S*/,
            f: s => { throw new Error(`Unrecognized token ${s.text}`); }
        });

        /** @type {Set<string>} */
        this._keywords = new Set(opts?.keywords || DEFAULT_KEYWORDS);

        /** @type {Spec[]} */
        this._specs = specs;

        /** @type {RegExp} */
        this._re = new RegExp(this._specs.map(d => `(${d.re.source})`).join('|'), 'g');

        this.tokenTypes = new Set([
            ATOKEN_TYPE_NEWLINE,
            ATOKEN_TYPE_STRING,
            ATOKEN_TYPE_NUMBER,
            ATOKEN_TYPE_NAME,
            ATOKEN_TYPE_EOF,
            Array.from(this._keywords),
            symbols,
        ].flat());

        this._newlineBehavior = opts?.newlineBehavior || 'keep';
    }

    /**
     * @param {string} s
     * @param {ALexerRuntimeOptions} [opts]
     * @returns {Generator<AToken>}
     */
    *lex(s, opts) {
        for (const token of this._lex(s, opts)) {
            switch (token.type) {
                case ATOKEN_TYPE_NEWLINE:
                    switch (this._newlineBehavior) {
                        case 'keep':
                            yield token;
                            break;
                    }
                    break;
                default:
                    yield token;
            }
        }
    }

    /**
     * @param {string} s
     * @param {ALexerRuntimeOptions} [opts]
     * @returns {Generator<AToken>}
     */
    *_lex(s, opts) {
        const state = {
            lexer: this,
            mark: {
                filename: opts?.filename || DEFAULT_FILENAME,
                mainIndex: 0,
                startIndex: 0,
                endIndex: 0,
                lineNumber: 1,
            },
            text: '',
        };
        const re = new RegExp(this._re, 'g');
        let lastNewlinesCount = 0;

        while (re.lastIndex < s.length) {
            const startIndex = re.lastIndex;
            const results = re.exec(s);
            if (results === null) {
                throw new UnreachableError();
            }
            state.mark = {
                ...state.mark,
                mainIndex: startIndex,
                startIndex: startIndex,
                endIndex: re.lastIndex,
                lineNumber: state.mark.lineNumber + lastNewlinesCount,
            };
            lastNewlinesCount = countChar(results[0], '\n');
            let resultIndex = 0;
            for (let i = 1; i < results.length; i++) {
                if (results[i] !== undefined) {
                    resultIndex = i;
                    break;
                }
            }
            state.text = results[resultIndex];
            resultIndex--;
            const callback = this._specs[resultIndex].f;
            yield* callback(state);
        }

        state.mark = {
            ...state.mark,
            mainIndex: re.lastIndex,
            startIndex: re.lastIndex,
            endIndex: re.lastIndex,
        };
        yield new AToken(state.mark, ATOKEN_TYPE_EOF);
    }

    /**
     * @param {string} s
     * @param {ALexerRuntimeOptions} [opts]
     * @returns {AToken[]}
     */
    list(s, opts) {
        return Array.from(this.lex(s, opts));
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
