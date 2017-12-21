#! /usr/bin/env node

/**
    @module d3plus-build
    @summary Compiles all files for distribution.
    @desc This script will compile 2 builds, one with all dependencies includes (full) and one with only the core code. Next, each of those builds is minified using uglifyjs. Finally, all those builds, along with the LICENSE and README, are compressed into a .zip file.
*/

const log = require("./log")("build compile"),
      rollup = require("./rollup"),
      shell = require("shelljs"),
      {name} = JSON.parse(shell.cat("package.json"));

shell.config.silent = true;

/**
    @summary Handles the results of the shell.exec callback function.
    @private
*/
function kill(code, stdout) {
  log.fail();
  shell.echo(stdout);
  shell.exit(code);
}

log.timer("transpiling ES6 for modules");
shell.rm("-rf", "es");
shell.mkdir("-p", "es");
shell.exec("buble -i index.js --no modules -m -o es/index.js", (code, stdout) => {
  if (code) kill(code, stdout);

  shell.exec("buble -i src --no modules -m -o es/src", (code, stdout) => {
    if (code) kill(code, stdout);

    rollup().then(() => {
      rollup({deps: true}).then(() => {

        log.timer("uglifying builds");
        shell.exec(`uglifyjs build/${name}.js -m --comments -o build/${name}.min.js`, (code, stdout) => {
          if (code) kill(code, stdout);

          shell.exec(`uglifyjs build/${name}.full.js -m --comments -o build/${name}.full.min.js`, (code, stdout) => {
            if (code) kill(code, stdout);

            log.timer("creating .zip distribution");
            const files = ["LICENSE", "README.md",
              `build/${name}.js`, `build/${name}.min.js`,
              `build/${name}.full.js`, `build/${name}.full.min.js`
            ];
            shell.exec(`rm -f build/${name}.zip && zip -j -q build/${name}.zip -- ${files.join(" ")}`, (code, stdout) => {
              if (code) kill(code, stdout);

              log.exit();
              shell.exit(0);

            });

          });

        });

      });

    });

  });

});
