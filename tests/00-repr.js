import assert from "../lib/assert.js";
import { repr } from "../lib/repr.js";



assert.eq(repr('hello'), "\"hello\"");
assert.eq(repr([1, 2, 3]), '[1, 2, 3]');
assert.eq(repr([1, 2, 3, 'hello']), '[1, 2, 3, \"hello\"]');

assert.eq(repr(undefined), 'undefined');

class CustomToString {
    toString() {
        return '<some-custom-toString>';
    }
}
assert.eq(repr(new CustomToString()), '<some-custom-toString>');


class NoCustomToString { }
assert.eq(repr(new NoCustomToString()), '[object Object]');

// pod
assert.eq(repr({ b: 'world', a: 'hello' }), `{"b": "world", "a": "hello"}`);
