import assert from "assert";
import forOf from "../src/forOf.js";
import it from "./jsdom.js";

it("for-of", () => {

  const result = forOf(10);
  assert.strictEqual(result.arr[9], 18, "for-of transpiling");
  assert.strictEqual(result.size, 4, "d3 es6 transpiling");

});
