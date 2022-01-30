import assert from "../lib/assert.js";
import { Matrix } from "../lib/linalg.js";

assert.eq(Matrix.fromRows([1, 2, 3]), Matrix.fromRows([1, 2, 3]));
assert.neq(Matrix.fromRows([1, 2, 3]), Matrix.fromRows([1, 2, 4]));
assert.eq(
    Matrix.fromRows(
        [1, 2, 3],
        [4, 5, 6],
    ),
    Matrix.fromRows(
        [1, 2, 3],
        [4, 5, 6]));
assert.eq(
    Matrix.fromRows(
        [1, 2, 3],
        [4, 5, 6],
    ),
    Matrix.fromColumns(
        [1, 4],
        [2, 5],
        [3, 6]));
assert.eq(
    Matrix.fromRows(
        [1, 2, 3],
        [4, 5, 6],
    ).transpose(),
    Matrix.fromRows(
        [1, 4],
        [2, 5],
        [3, 6]));
