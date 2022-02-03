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

const parser = new AParser({
    start: '#',
    rules: [
        { lhs: '#', rhs: ['#start'], throwOnFail: true },
        { lhs: '#stmt_', rhs: ['#stmt'], throwOnFail: true },
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
    ],
}, {
    lexer: new ALexer({
        keywords: ['bg'],
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
