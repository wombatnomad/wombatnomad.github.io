/**
 * A Linear Algebra Library
 */

import assert from "./assert.js";
import { eqNumberArray, ExplicitEquals } from "./ops.js";

const ERROR_TAG_ZERO_DIMENSIONS = 'A Matirx cannot have zero dimensions';

/**
 * @implements {ExplicitEquals}
 */
export class Matrix {

    /**
     * Create a new column vector
     * @param  {...number} column values in the column
     * @returns {Matrix}
     */
    static col(...column) {
        return this.fromColumns(column);
    }

    /**
     * Creates a new row vector
     * @param  {...number} row
     * @returns {Matrix}
     */
    static row(...row) {
        return this.fromRows(row);
    }

    /**
     * Create a new Matrix with the given column values
     * @param {ArrayLike<number>[]} columns
     * @returns {Matrix}
     */
    static fromColumns(...columns) {
        const C = columns.length;
        assert.xlt(0, C, ERROR_TAG_ZERO_DIMENSIONS);
        const R = columns[0].length;
        assert.xlt(0, R, ERROR_TAG_ZERO_DIMENSIONS);
        for (let c = 1; c < C; c++) {
            assert.eq(columns[c].length, R, 'Columns must all have same length');
        }
        const values = new Float64Array(R * C);
        let i = 0;
        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                values[i++] = columns[c][r];
            }
        }
        return new Matrix(R, C, values);
    }

    /**
     * Create a new Matrix with the given row values
     * @param {number[][]} rows
     * @returns {Matrix}
     */
    static fromRows(...rows) {
        const R = rows.length;
        assert.xlt(0, R, ERROR_TAG_ZERO_DIMENSIONS);
        const C = rows[0].length;
        assert.xlt(0, C, ERROR_TAG_ZERO_DIMENSIONS);
        for (let r = 1; r < R; r++) {
            assert.eq(rows[r].length, C, 'Rows must all have same length');
        }
        const values = new Float64Array(R * C);
        let i = 0;
        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                values[i++] = rows[r][c];
            }
        }
        return new Matrix(R, C, values);
    }

    /**
     * Produces the columns of this Matrix as column vectors
     * @returns {Generator<Matrix, void, void>}
     */
    *columns() {
        for (let c = 0; c < this.C; c++) {
            const values = new Float64Array(this.R);
            for (let r = 0; r < this.R; r++) {
                values[r] = this.values[r * this.C + c];
            }
            yield new Matrix(this.R, 1, values);
        }
    }

    /**
     * Produces the rows of this Matrix as row vectors
     * @returns {Generator<Matrix, void, void>}
     */
    *rows() {
        for (let r = 0; r < this.R; r++) {
            const values = Float64Array.from(this.values.subarray(r * this.C, (r + 1) * this.C));
            yield new Matrix(1, this.C, values);
        }
    }

    /**
     * @param {number} R
     * @param {number} C
     * @param {Float64Array} values
     */
    constructor(R, C, values) {
        /** @type {number} number of rows in this Matrix */
        this.R = R;
        /** @type {number} number of columns in this Matrix */
        this.C = C;
        /** @type {Float64Array} Rows of the Matrix concatenated together */
        this.values = values;
    }

    /**
     * @returns {Matrix}
     */
    transpose() {
        const values = new Float64Array(this.R * this.C);
        for (let r = 0; r < this.R; r++) {
            for (let c = 0; c < this.C; c++) {
                values[c * this.R + r] = this.values[r * this.C + c];
            }
        }
        return new Matrix(this.C, this.R, values);
    }

    /**
     * @param {any} other
     * @returns {boolean}
     */
    equals(other) {
        if (other.constructor === Matrix) {
            return (
                this.R === other.R &&
                this.C === other.C &&
                eqNumberArray(this.values, other.values)
            );
        }
        return false;
    }

    /**
     * @returns {string}
     */
    toString() {
        const parts = [];
        for (const row of this.rows()) {
            parts.push(`[${row.values.join(',')}]`);
        }
        return `Matrix.fromRows(${parts.join(',')})`;
    }
}
