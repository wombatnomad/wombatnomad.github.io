import { ALexer } from "../lib/stable/alexer.js";
import assert from "../lib/stable/assert.js";


/**
 * @param {ALexer} lexer
 * @param {string} s
 * @returns {{type: string, value?: any}[]}
 */
function lex(lexer, s) {
    return lexer.list(s).map(t =>
        t.value === undefined ?
            { type: t.type } :
            { type: t.type, value: t.value });
}

/**
 * Lex and get line numbers
 * @param {ALexer} lexer
 * @param {string} s
 * @returns {{type: string, line: number}[]}
 */
function lexLN(lexer, s) {
    return lexer.list(s).map(t => ({ type: t.type, line: t.mark.lineNumber }));
}

{
    const lexer = new ALexer();
    assert.eq(
        lex(lexer, 'class hello, "world" 123 8.88 0xAF'),
        [
            { "type": "class" },
            { "type": "NAME", "value": "hello" },
            { "type": "," },
            { "type": "STRING", "value": "world" },
            { "type": "NUMBER", "value": 123 },
            { "type": "NUMBER", "value": 8.88 },
            { "type": "NUMBER", "value": 175 },
            { "type": "EOF" },
        ],
    );
    assert.eq(
        lex(lexer, '"\\""'),
        [
            { "type": "STRING", "value": "\"" },
            { "type": "EOF" },
        ],
    );
    assert.eq(
        lex(lexer, `
        `),
        [
            { "type": "NEWLINE" },
            { "type": "EOF" },
        ],
    );
    assert.eq(
        lexLN(lexer, `hello world {
            a b c;
        }
        `),
        [
            { "type": "NAME", "line": 1 },
            { "type": "NAME", "line": 1 },
            { "type": "{", "line": 1 },
            { "type": "NEWLINE", "line": 1 },
            { "type": "NAME", "line": 2 },
            { "type": "NAME", "line": 2 },
            { "type": "NAME", "line": 2 },
            { "type": ";", "line": 2 },
            { "type": "NEWLINE", "line": 2 },
            { "type": "}", "line": 3 },
            { "type": "NEWLINE", "line": 3 },
            { "type": "EOF", "line": 4 },
        ],
    );
}
