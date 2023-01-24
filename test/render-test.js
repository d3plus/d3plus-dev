import assert from "assert";
import {Rect} from "d3plus-shape";
import it from "./jsdom.js";

it("render callback", function *() {

  yield cb => {

    new Rect()
      .data([{id: "test"}])
      .render(cb);

  };

  assert.strictEqual(document.getElementsByTagName("svg").length, 1, "automatically added <svg> element to page");

});
