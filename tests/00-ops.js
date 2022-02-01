import assert from '../lib/assert.js';
import * as cmp from '../lib/ops.js';

assert.eq([1, 2, 3], [1, 2, 3], 'equivalent arrays should be equal');
assert.neq([1, 2, 3], [1, 2, 3, 4], 'arrays should not always be equal');
assert.neq([1, 2, 3, 4], [1, 2, 3], 'arrays should not always be equal');



// The following will always work functionally, but this also tests your
// local type checking setup.
// 'Sample' should be a cmp.ExplicitLessThan

class Sample {
    /**
     * @param {any} other
     * @returns {boolean}
     */
    lessThan(other) {
        return true;
    }
}
cmp.lt(new Sample(), new Sample());


// When using native equality, two pods with equivalent values
// are not considered equal
assert.xneq({ a: 2 }, { a: 2 });