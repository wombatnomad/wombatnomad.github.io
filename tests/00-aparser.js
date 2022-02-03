import { AParser } from "../lib/aparser.js";
import assert from "../lib/assert.js";
import { AssertionError } from "../lib/err.js";

{
    const parser = new AParser({
        start: '#',
        rules: [
            { lhs: '#', rhs: ['#expr'] },
            { lhs: '#expr', rhs: ['#e'], throwOnFail: true },
            { lhs: '#e', rhs: ['NUMBER'] },
            {
                lhs: '#e',
                rhs: ['*', '#e', '#expr'],
                f: (_, a, b) => a * b,
            },
            {
                lhs: '#e',
                rhs: ['/', '#e', '#expr'],
                f: (_, a, b) => a / b,
            },
            {
                lhs: '#e',
                rhs: ['+', '#e', '#expr'],
                f: (_, a, b) => a + b,
            },
            {
                lhs: '#e',
                rhs: ['-', '#e', '#expr'],
                f: (_, a, b) => a - b,
            },
        ],
    });
    assert.eq(parser.parseValue('2'), 2);
    assert.eq(parser.parseValue('+ 2 7'), 9);
    assert.eq(parser.parseValue('* + 2 7 8'), (2 + 7) * 8);
}

// disallow zero length production rules
assert.throws(AssertionError, () => {
    new AParser({
        start: '#',
        rules: [{ lhs: '#', rhs: [] }],
    });
});

// detect a nonterminal that never appears on the left hand side
assert.throws(AssertionError, () => {
    new AParser({
        start: '#',
        rules: [{ lhs: '#', rhs: ['#x'] }],
    });
});
