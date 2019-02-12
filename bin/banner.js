const assign = require("./polyfill/assign.js"),
      find = require("./polyfill/find.js"),
      includes = require("./polyfill/includes.js"),
      innerHTML = require("./polyfill/innerHTML.js"),
      shell = require("shelljs"),
      startsWith = require("./polyfill/startsWith.js"),
      {description, homepage, license, name, version} = JSON.parse(shell.cat("package.json"));

module.exports = `/*
  ${name} v${version}
  ${description}
  Copyright (c) ${new Date().getFullYear()} D3plus - ${homepage}
  @license ${license}
*/

${assign}

${includes}

${find}

${startsWith}

${innerHTML}
`;
