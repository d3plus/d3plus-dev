import zora from "zora";
import {Rect} from "d3plus-shape";

export default zora()
  .test("render callback", function *(assert) {

    yield cb => {

      new Rect()
        .data([{id: "test"}])
        .render(cb);

    };

    assert.equal(document.getElementsByTagName("svg").length, 1, "automatically added <svg> element to page");

  });
