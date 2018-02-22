import test from "zora";
import {Rect} from "d3plus-shape";

test("render callback", function *(assert) {

  yield cb => {

    new Rect()
      .data([{id: "test"}])
      .render(cb);

  };

  assert.equal(document.getElementsByTagName("svg").length, 1, "automatically added <svg> element to page");

});

export default test;
