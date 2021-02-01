import {test} from "zora";
import forOf from "../src/forOf";

test("for-of", assert => {

  const result = forOf(10);
  assert.equal(result.arr[9], 18, "for-of transpiling");
  assert.equal(result.size, 6, "d3 es6 transpiling");

});

export default test;
