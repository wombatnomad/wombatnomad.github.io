import { ALexer } from "../lib/alexer.js";
import assert from "../lib/assert.js";


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

{
    const lexer = new ALexer();
    assert.eq(
        lex(lexer, 'hello, "world" 123 8.88 0xAF'),
        [
            { "type": "@IDENT", "value": "hello" },
            { "type": "," },
            { "type": "@STRING", "value": "world" },
            { "type": "@NUMBER", "value": 123 },
            { "type": "@NUMBER", "value": 8.88 },
            { "type": "@NUMBER", "value": 175 },
            { "type": "@EOF" },
        ],
    );
    assert.eq(
        lex(lexer, '"\\""'),
        [
            { "type": "@STRING", "value": "\"" },
            { "type": "@EOF" },
        ],
    );
    assert.eq(
        lex(lexer, `
        `),
        [
            { "type": "@NEWLINE" },
            { "type": "@EOF" },
        ],
    );
}
