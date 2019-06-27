#! /usr/bin/env node

/**
    @module d3plus-build
    @summary Compiles all files for distribution.
    @desc This script will compile 2 builds, one with all dependencies includes (full) and one with only the core code. Next, each of those builds is minified using uglifyjs. Finally, all those builds, along with the LICENSE and README, are compressed into a .zip file.
*/

const execAsync = require("./execAsync"),
      log = require("./log")("build compile"),
      rollup = require("./rollup"),
      shell = require("shelljs"),
      {name} = JSON.parse(shell.cat("package.json"));

shell.config.silent = true;

log.timer("transpiling ES6 for modules");
shell.rm("-rf", "es");
shell.mkdir("-p", "es");
execAsync("babel index.js --out-file es/index.js")
  .then(() => {
    if (shell.test("-d", "./src")) return execAsync("babel src --out-dir es/src");
    else return true;
  })
  .then(() => rollup())
  .then(() => rollup({deps: true}))
  .then(() => {
    log.timer("uglifying builds");
    return execAsync(`uglifyjs build/${name}.js -m --comments -o build/${name}.min.js`);
  })
  .then(() => execAsync(`uglifyjs build/${name}.full.js -m --comments -o build/${name}.full.min.js`))
  .then(() => {
    log.timer("creating .zip distribution");
    const files = ["LICENSE", "README.md",
      `build/${name}.js`, `build/${name}.min.js`,
      `build/${name}.full.js`, `build/${name}.full.min.js`
    ];
    return execAsync(`rm -f build/${name}.zip && zip -j -q build/${name}.zip -- ${files.join(" ")}`);
  })
  .then(() => {
    log.exit();
    shell.exit(0);
  })
  .catch(err => {
    log.fail(err);
    log.exit();
    shell.exit(1);
  });
