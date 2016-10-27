#! /usr/bin/env node

const log = require("./log")("build compile"),
      rollup = require("./rollup"),
      shell = require("shelljs"),
      {name} = JSON.parse(shell.cat("package.json"));

shell.config.silent = true;
function kill(code, stdout) {
  log.fail();
  shell.echo(stdout);
  shell.exit(code);
}

log.timer("compile builds");
rollup().then(() => {
  log.timer("compile full builds");
  rollup({deps: true}).then(() => {

    log.timer("uglify builds");
    shell.exec(`uglifyjs build/${name}.js -m --comments -o build/${name}.min.js`, (code, stdout) => {
      if (code) kill(code, stdout);

      shell.exec(`uglifyjs build/${name}.full.js -m --comments -o build/${name}.full.min.js`, (code, stdout) => {
        if (code) kill(code, stdout);

        log.timer("create .zip distribution");
        const files = ["LICENSE", "README.md",
                       `build/${name}.js`, `build/${name}.min.js`,
                       `build/${name}.full.js`, `build/${name}.full.min.js`];
        shell.exec(`rm -f build/${name}.zip && zip -j -q build/${name}.zip -- ${files.join(" ")}`, (code, stdout) => {
          if (code) kill(code, stdout);

          log.exit();
          shell.exit(0);

        });

      });

    });

  });
});
