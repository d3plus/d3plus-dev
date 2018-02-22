import test from "zora";
import {strip, textSplit} from "d3plus-text";

test("unicode", assert => {

  assert.equal(strip("á"), "a", "diacritic");

  const chinese = textSplit("里句。");
  assert.ok(chinese[0] === "里" && chinese[1] === "句。", "simplified chinese");

  const burmese = textSplit("ကြောယ်။");
  assert.ok(burmese[0] === "ကြော" && burmese[1] === "ယ်။", "burmese");

  const lao = textSplit("ຕໍ່ດ້.");
  assert.ok(lao[0] === "ຕໍ່" && lao[1] === "ດ້.", "lao");

});

export default test;
