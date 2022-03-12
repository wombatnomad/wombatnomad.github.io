import assert from "../lib/stable/assert.js";
import { Matrix } from "../lib/x/linalg.js";

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

assert.eq(
    Matrix.fromRows(
        [1, 2, 3],
        [4, 5, 6],
    ).add(Matrix.fromRows(
        [5, 6, 7],
        [8, 9, 10],
    )),
    Matrix.fromRows(
        [6, 8, 10],
        [12, 14, 16],
    ),
);

assert.eq(
    Matrix.fromRows(
        [1, 2, 3],
        [4, 5, 6],
    ).subtract(Matrix.fromRows(
        [5, 6, 7],
        [8, 9, 10],
    )),
    Matrix.fromRows(
        [-4, -4, -4],
        [-4, -4, -4],
    ),
);

assert.eq(
    Matrix.fromRows(
        [77, 88, 99],
        [6, 8, 10],
    ).scale(1.5),
    Matrix.fromRows(
        [115.5, 132, 148.5],
        [9, 12, 15],
    )
);
