import zora from "zora";
import {strip, textSplit} from "d3plus-text";

export default zora()
  .test("root", assert => {

    assert.equal(true, true, "root test directory");

  })
  .test("strip", assert => {

    assert.equal(strip("one two"), "one-two", "Space");
    assert.equal(strip("one@two"), "onetwo", "Removed");
    assert.equal(strip("á"), "a", "Diacritic");

  })
  .test("textSplit", assert => {

    assert.equal(textSplit("-4")[0], "-4", "string starting with split character");
    assert.equal(textSplit("This & That")[1], "&", "solo split character");

    const chinese = textSplit("里句。");
    assert.ok(chinese[0] === "里" && chinese[1] === "句。", "simplified chinese");

    const burmese = textSplit("ကြောယ်။");
    assert.ok(burmese[0] === "ကြော" && burmese[1] === "ယ်။", "burmese");

    const lao = textSplit("ຕໍ່ດ້.");
    assert.ok(lao[0] === "ຕໍ່" && lao[1] === "ດ້.", "lao");

  });
