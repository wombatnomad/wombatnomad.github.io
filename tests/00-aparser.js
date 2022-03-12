import { AParser } from "../lib/stable/aparser.js";
import assert from "../lib/stable/assert.js";
import { AssertionError } from "../lib/stable/err.js";

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

{
    // direct left recursive grammar
    const parser = new AParser({
        start: '#',
        rules: [
            { lhs: '#', rhs: ['#expr_'] },
            { lhs: '#expr_', rhs: ['#expr'], throwOnFail: true },
            { lhs: '#atom_', rhs: ['#atom'], throwOnFail: true },
            { lhs: '#product_', rhs: ['#product'], throwOnFail: true },
            { lhs: '#atom', rhs: ['NUMBER'] },
            { lhs: '#atom', rhs: ['(', '#expr_', ')'], f: (_, x) => x },
            { lhs: '#atom', rhs: ['-', '#atom_'], f: (_, x) => -x },
            { lhs: '#atom', rhs: ['+', '#atom_'], f: (_, x) => x },
            { lhs: '#product', rhs: ['#atom'] },
            { lhs: '#product', rhs: ['#product', '*', '#atom_'], f: (a, _, b) => a * b },
            { lhs: '#product', rhs: ['#product', '/', '#atom_'], f: (a, _, b) => a / b },
            { lhs: '#sum', rhs: ['#product'] },
            { lhs: '#sum', rhs: ['#sum', '+', '#product_'], f: (a, _, b) => a + b },
            { lhs: '#sum', rhs: ['#sum', '-', '#product_'], f: (a, _, b) => a - b },
            { lhs: '#expr', rhs: ['#sum'] },
        ],
    });
    assert.eq(parser.parseValue('2'), 2);
    assert.eq(parser.parseValue('2 + 7'), 9);
    assert.eq(parser.parseValue('2 + 7 * 8'), 2 + 7 * 8);
    assert.eq(parser.parseValue('(2 + 7) * 8'), (2 + 7) * 8);
    assert.eq(parser.parseValue('(2 + -7) * 8'), (2 + -7) * 8);
    assert.throws(Error, () => parser.parseValue('(2 + -x) * 8'));
}
