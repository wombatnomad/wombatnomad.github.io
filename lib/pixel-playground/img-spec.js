import { ALexer } from "../stable/alexer.js";
import { AParser } from "../stable/aparser.js";
import { Bitmap } from "../x/bmp.js";
import { AssertionError } from "../stable/err.js";
import { repr } from "../stable/repr.js";

/**
 * @typedef {'by-tolerance' | 'continuous'} InterpolationMethod
 */

/**
 * @typedef {function(Scope):[number, number, number]} ColorFunction
 */

/**
 * @typedef {{
 *   colorf: ColorFunction,              // currently active brush color
 *   x: number,                          // current x value we're calculating for
 *   y: number,                          // current y value we're calculating for
 *   scale: number,                      // 'length' of each pixel
 *   tolerance: number,                  // when using 'by-tolerance', determines which pixels to plot
 *   interpolation: InterpolationMethod, // how to plot pixels for equality
 * }} Scope
 */

/**
 * Utility purely for aid with types
 * @param {function(Scope,Bitmap):any} f
 */
function stmtf(f) {
    return f;
}

/**
 * Utility purely for aid with types
 * @param {function(Scope):number} f
 */
function exprf(f) {
    return f;
}

/**
 * Utility purely for aid with types
 * @param {function(Scope):[number, number, number]} f
 */
function expr3f(f) {
    return f;
}

/**
 * Utility purely for aid with types
 * relation
 * @param {function(Scope):boolean} f
 */
function relf(f) {
    return f;
}

const colorHex = /^[a-fA-F0-9]{6}$/;

const parser = new AParser({
    start: '#',
    rules: [
        { lhs: '#', rhs: ['#start'], throwOnFail: true },
        { lhs: '#stmt_', rhs: ['#stmt'], throwOnFail: true },
        { lhs: '#color-expr_', rhs: ['#color-expr'], throwOnFail: true },
        { lhs: '#expr_', rhs: ['#expr'], throwOnFail: true },
        { lhs: '#atom_', rhs: ['#atom'], throwOnFail: true },
        { lhs: '#pow_', rhs: ['#pow'], throwOnFail: true },
        { lhs: '#product_', rhs: ['#product'], throwOnFail: true },
        { lhs: '#relation_', rhs: ['#relation'], throwOnFail: true },
        { lhs: '#eof_', rhs: ['EOF'], throwOnFail: true },
        {
            lhs: '#start', rhs: ['#chunk', '#eof_'], f: chunk => stmtf((scope, bmp) => {
                for (const stmt of chunk) {
                    stmt(scope, bmp);
                }
            })
        },
        { lhs: '#chunk', rhs: ['#stmt_'], f: stmt => [stmt] },
        { lhs: '#chunk', rhs: ['#chunk', '#stmt'], f: (c, stmt) => { c.push(stmt); return c; } },
        {
            lhs: '#stmt', rhs: ['fill', '#color-expr_'], f: (_, colorf) => stmtf((scope, bmp) => {
                const scale = scope.scale;
                const W = bmp.width;
                const H = bmp.height;
                for (let w = 0; w < W; w++) {
                    for (let h = 0; h < H; h++) {
                        scope.x = (w - W / 2) * scale;
                        scope.y = (h - H / 2) * scale;
                        bmp.setPixel([w, h], colorf(scope));
                    }
                }
            })
        },
        { lhs: '#color-expr', rhs: ['[', '#color-expr-body', ']'], f: (_, e) => e },
        { lhs: '#color-expr', rhs: ['[', '#color-expr-body', ',', ']'], f: (_, e) => e },
        {
            lhs: '#color-expr-body',
            rhs: ['#expr_', ',', '#expr_', ',', '#expr_'],
            f: (e1, _1, e2, _2, e3) => expr3f(s => [e1(s), e2(s), e3(s)]),
        },
        {
            lhs: '#color-expr', rhs: ['STRING'], f: s => expr3f(scope => {
                switch (s) {
                    case 'red':
                        return [200, 0, 0];
                    case 'green':
                        return [0, 200, 0];
                    case 'blue':
                        return [0, 0, 200];
                    default:
                        if (colorHex.test(s)) {
                            const red = parseInt(s.slice(0, 2), 16);
                            const green = parseInt(s.slice(2, 4), 16);
                            const blue = parseInt(s.slice(4, 6), 16);
                            return [red, green, blue];
                        }
                        throw new Error(`${s} is not a recognized color`);
                }
            })
        },
        {
            lhs: '#stmt', rhs: ['color', '#color-expr_'], f: (_, colorf) => stmtf((scope, bmp) => {
                scope.colorf = colorf;
            })
        },
        {
            lhs: '#stmt', rhs: ['draw', '#relation_'], f: (_, relation) => stmtf((scope, bmp) => {
                const scale = scope.scale;
                const colorf = scope.colorf;
                const W = bmp.width;
                const H = bmp.height;
                for (let w = 0; w < W; w++) {
                    for (let h = 0; h < H; h++) {
                        scope.x = (w - W / 2) * scale;
                        scope.y = (h - H / 2) * scale;
                        if (relation(scope)) {
                            bmp.setPixel([w, h], colorf(scope));
                        }
                    }
                }
            })
        },
        {
            lhs: '#relation', rhs: ['and', '#relations'], f: (_, rels) => relf(s => {
                for (const relation of rels) {
                    if (!relation(s)) {
                        return false;
                    }
                }
                return true;
            }),
        },
        {
            lhs: '#relation', rhs: ['or', '#relations'], f: (_, rels) => relf(s => {
                for (const relation of rels) {
                    if (relation(s)) {
                        return true;
                    }
                }
                return false;
            }),
        },
        {
            lhs: '#relation', rhs: ['#expr_', '=', '#expr_'], f: (lhs, _, rhs) => relf(s => {
                switch (s.interpolation) {
                    case 'by-tolerance':
                        // Matches of lhs and rhs are within tolerance
                        const tolerance = s.tolerance;
                        const lhsValue = lhs(s);
                        const rhsValue = rhs(s);
                        return Math.abs(lhsValue - rhsValue) <= tolerance;
                    case 'continuous':
                        // Assume expressions are continuous, and set the pixel if we 'cross'
                        {
                            // vary x to see if that induces crossing
                            const originalX = s.x;
                            const lhs1 = lhs(s);
                            const rhs1 = rhs(s);
                            s.x += s.scale;
                            const lhs2 = lhs(s);
                            const rhs2 = rhs(s);
                            s.x = originalX;
                            if (lhs1 <= rhs1 && lhs2 >= rhs2 || lhs1 >= rhs1 && lhs2 <= rhs2) {
                                return true;
                            }
                        }
                        // vary y to see if that induces crossing
                        const originalY = s.y;
                        const lhs1 = lhs(s);
                        const rhs1 = rhs(s);
                        s.y += s.scale;
                        const lhs2 = lhs(s);
                        const rhs2 = rhs(s);
                        s.y = originalY;
                        return lhs1 <= rhs1 && lhs2 >= rhs2 || lhs1 >= rhs1 && lhs2 <= rhs2;
                    default:
                        throw new AssertionError(`Unrecognized interpolation ${s.interpolation}`);
                }
            })
        },
        { lhs: '#relation', rhs: ['#expr_', '<', '#expr_'], f: (lhs, _, rhs) => relf(s => lhs(s) < rhs(s)) },
        { lhs: '#relation', rhs: ['#expr_', '>', '#expr_'], f: (lhs, _, rhs) => relf(s => lhs(s) > rhs(s)) },
        { lhs: '#relation', rhs: ['#expr_', '<=', '#expr_'], f: (lhs, _, rhs) => relf(s => lhs(s) <= rhs(s)) },
        { lhs: '#relation', rhs: ['#expr_', '>=', '#expr_'], f: (lhs, _, rhs) => relf(s => lhs(s) >= rhs(s)) },
        { lhs: '#relation-seq', rhs: ['#relation'], f: (r) => [r] },
        { lhs: '#relation-seq', rhs: ['#relation-seq', ']'], f: rs => rs },
        { lhs: '#relation-seq', rhs: ['#relation-seq', ',', ']'], f: rs => rs },
        { lhs: '#relation-seq', rhs: ['#relation-seq', ',', '#relation_'], f: (rs, _, r) => { rs.push(r); return rs; } },
        { lhs: '#relations', rhs: ['[', '#relation-seq'], f: (_, rs) => rs },
        { lhs: '#relations', rhs: ['[', '#relation-seq'], f: (_, rs) => rs },
        { lhs: '#atom', rhs: ['NUMBER'], f: n => exprf(_ => n) },
        { lhs: '#atom', rhs: ['x'], f: _ => exprf(scope => scope.x) },
        { lhs: '#atom', rhs: ['y'], f: _ => exprf(scope => scope.y) },
        { lhs: '#atom', rhs: ['(', '#expr_', ')'], f: (_, e) => e },
        { lhs: '#atom', rhs: ['sin', '(', '#expr_', ')'], f: (_1, _2, e) => exprf(s => Math.sin(e(s))) },
        { lhs: '#atom', rhs: ['cos', '(', '#expr_', ')'], f: (_1, _2, e) => exprf(s => Math.cos(e(s))) },
        { lhs: '#atom', rhs: ['abs', '(', '#expr_', ')'], f: (_1, _2, e) => exprf(s => Math.abs(e(s))) },
        { lhs: '#pow', rhs: ['#atom', '**', '#pow_'], f: (a, _, b) => exprf(s => a(s) ** b(s)) },
        { lhs: '#pow', rhs: ['#atom'] },
        { lhs: '#pow', rhs: ['-', '#pow_'], f: (_, e) => exprf(scope => -e(scope)) },
        { lhs: '#pow', rhs: ['+', '#pow_'], f: (_, e) => e },
        { lhs: '#product', rhs: ['#pow'] },
        { lhs: '#product', rhs: ['#product', '%', '#pow_'], f: (a, _, b) => exprf(s => a(s) % b(s)) },
        { lhs: '#product', rhs: ['#product', '*', '#pow_'], f: (a, _, b) => exprf(s => a(s) * b(s)) },
        { lhs: '#product', rhs: ['#product', '/', '#pow_'], f: (a, _, b) => exprf(s => a(s) / b(s)) },
        { lhs: '#sum', rhs: ['#product'] },
        { lhs: '#sum', rhs: ['#sum', '+', '#product_'], f: (a, _, b) => exprf(s => a(s) + b(s)) },
        { lhs: '#sum', rhs: ['#sum', '-', '#product_'], f: (a, _, b) => exprf(s => a(s) - b(s)) },
        { lhs: '#expr', rhs: ['#sum'] },
        { lhs: '#stmt', rhs: ['scale', 'NUMBER'], f: (_, t) => stmtf(s => { s.scale = t; }) },
        { lhs: '#stmt', rhs: ['tolerance', 'NUMBER'], f: (_, t) => stmtf(s => { s.tolerance = t; }) },
        {
            lhs: '#stmt', rhs: ['interpolation', 'tolerance'], f: (_, t) => stmtf(s => {
                s.interpolation = 'by-tolerance';
            })
        },
        {
            lhs: '#stmt', rhs: ['interpolation', 'continuous'], f: (_, t) => stmtf(s => {
                s.interpolation = 'continuous';
            })
        },
    ],
}, {
    lexer: new ALexer({
        keywords: [
            'fill', 'color', 'draw', 'scale', 'tolerance', 'interpolation', 'continuous', 'x', 'y',
            'sin', 'cos', 'tan', 'abs',
            'and', 'or',
        ],
        newlineBehavior: 'ignore',
    })
});

export class ImageSpec {
    /**
     * @param {string} source
     */
    static fromSource(source) {
        return new ImageSpec(parser.parseValue(source));
    }

    /**
     * @param {function(Scope, Bitmap):void} f
     */
    constructor(f) {
        this._f = f;
    }

    /**
     * @param {Bitmap} bmp
     */
    applyToBitmap(bmp) {
        this._f({
            x: 0,
            y: 0,
            colorf: _ => [200, 200, 200],
            tolerance: 0.1,
            scale: 1,
            interpolation: 'continuous',
        }, bmp);
    }

    toBitmap() {
        const bmp = new Bitmap(400, 400);
        this.applyToBitmap(bmp);
        return bmp;
    }
}
