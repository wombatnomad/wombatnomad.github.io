import assert from "../lib/assert.js";
import { reversed, sorted } from "../lib/sort.js";


assert.eq(
    sorted([1, 2, 3, 10, 2, 7]),
    [1, 2, 2, 3, 7, 10],
);

assert.eq(
    sorted([1, 2, 3, 10, 2, 7], { reverse: true }),
    [10, 7, 3, 2, 2, 1],
);

assert.eq(
    sorted([
        [10, 'a'],
        [2, 'z'],
    ]),
    [
        [2, 'z'],
        [10, 'a'],
    ],
);

// using native comparisons, JavaScript will actually convert to
// string first and then compare.
assert.eq(
    sorted([
        [10, 'a'],
        [2, 'z'],
    ], { useNativeComparison: true }),
    [
        [10, 'a'],
        [2, 'z'],
    ],
);


assert.eq(
    reversed([1, 2, 3]),
    [3, 2, 1],
);
