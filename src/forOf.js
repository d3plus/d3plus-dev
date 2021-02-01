import {selectAll} from "d3-selection";

export default (n = 5) => {

  const arr = new Array(n).fill().map((_, i) => i);
  for (const i of arr) arr[i] *= 2;

  return {
    size: selectAll("*").size(),
    arr
  };

};
