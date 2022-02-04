import { ALexer } from "../alexer.js";
import { AParser } from "../aparser.js";
import { Bitmap } from "../bmp.js";
import { repr } from "../repr.js";


/**
 * Utility purely for aid with types
 * @param {function(Object.<string,any>,Bitmap):any} f
 */
function stmtf(f) {
    return f;
}

/**
 * Utility purely for aid with types
 * @param {function(Object.<string,any>):number} f
 */
function exprf(f) {
    return f;
}

/**
 * Utility purely for aid with types
 * relation
 * @param {function(Object.<string,any>):boolean} f
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
        { lhs: '#expr_', rhs: ['#expr'], throwOnFail: true },
        { lhs: '#atom_', rhs: ['#atom'], throwOnFail: true },
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
            lhs: '#stmt', rhs: ['bg', '#color'], f: (_, color) => stmtf((scope, bmp) => {
                for (let w = 0; w < bmp.width; w++) {
                    for (let h = 0; h < bmp.height; h++) {
                        bmp.setPixel([w, h], color);
                    }
                }
            })
        },
        { lhs: '#color', rhs: ['NUMBER', 'NUMBER', 'NUMBER'], f: (...args) => args },
        {
            lhs: '#color', rhs: ['STRING'], f: s => {
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
            }
        },
        {
            lhs: '#stmt', rhs: ['fg', '#color'], f: (_, color) => stmtf((scope, bmp) => {
                scope.fg = color;
            })
        },
        {
            lhs: '#stmt', rhs: ['eq', '#relation_'], f: (_, relation) => stmtf((scope, bmp) => {
                const fg = scope.fg || [20, 20, 20];
                const W = scope.width || bmp.width;
                const H = scope.height || bmp.height;
                for (let w = 0; w < W; w++) {
                    for (let h = 0; h < H; h++) {
                        scope.x = w - W / 2;
                        scope.y = h - H / 2;
                        if (relation(scope)) {
                            bmp.setPixel([w, h], fg);
                        }
                    }
                }
            })
        },
        {
            lhs: '#relation', rhs: ['#expr_', '=', '#expr_'], f: (lhs, _, rhs) => relf(s => {
                const tolerance = s.tolerance || 0.01;
                const lhsValue = lhs(s);
                const rhsValue = rhs(s);
                return Math.abs(lhsValue - rhsValue) <= tolerance;
            })
        },
        { lhs: '#relation', rhs: ['#expr_', '<', '#expr_'], f: (lhs, _, rhs) => relf(s => lhs(s) < rhs(s)) },
        { lhs: '#atom', rhs: ['NUMBER'], f: n => exprf(_ => n) },
        { lhs: '#atom', rhs: ['x'], f: _ => exprf(scope => scope.x) },
        { lhs: '#atom', rhs: ['y'], f: _ => exprf(scope => scope.y) },
        { lhs: '#atom', rhs: ['(', '#expr_', ')'], f: (_, e) => e },
        { lhs: '#atom', rhs: ['-', '#atom_'], f: (_, e) => exprf(scope => -e(scope)) },
        { lhs: '#atom', rhs: ['+', '#atom_'], f: (_, e) => e },
        { lhs: '#product', rhs: ['#atom'] },
        { lhs: '#product', rhs: ['#product', '*', '#atom_'], f: (a, _, b) => exprf(s => a(s) * b(s)) },
        { lhs: '#product', rhs: ['#product', '/', '#atom_'], f: (a, _, b) => exprf(s => a(s) / b(s)) },
        { lhs: '#sum', rhs: ['#product'] },
        { lhs: '#sum', rhs: ['#sum', '+', '#product_'], f: (a, _, b) => exprf(s => a(s) + b(s)) },
        { lhs: '#sum', rhs: ['#sum', '-', '#product_'], f: (a, _, b) => exprf(s => a(s) - b(s)) },
        { lhs: '#expr', rhs: ['#sum'] },
    ],
}, {
    lexer: new ALexer({
        keywords: ['bg', 'fg', 'eq', 'x', 'y'],
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
     * @param {function(object, Bitmap):void} f
     */
    constructor(f) {
        this._f = f;
    }

    /**
     * @param {Bitmap} bmp
     */
    applyToBitmap(bmp) {
        this._f({}, bmp);
    }

    toBitmap() {
        const bmp = new Bitmap(400, 400);
        this.applyToBitmap(bmp);
        return bmp;
    }
}
