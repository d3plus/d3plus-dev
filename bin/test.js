#! /usr/bin/env node

const commonjs = require("rollup-plugin-commonjs"),
      deps = require("rollup-plugin-node-resolve"),
      json = require("rollup-plugin-json"),
      log = require("./log")("testing suite"),
      rollup = require("rollup"),
      shell = require("shelljs"),
      {name} = JSON.parse(shell.cat("package.json"));

log.timer("linting code");
shell.config.silent = true;
shell.exec("eslint --color index.js bin/*.js bin/**/*.js src/*.js src/**/*.js test/*.js test/**/*.js", (code, stdout) => {

  if (code) {
    log.fail();
    shell.echo(stdout);
    shell.exit(code);
  }
  else {
    log.done();

    const tests = shell.ls("-R", "test/**/*.js");
    if (tests.length) {

      log.timer("unit and browser tests");
      tests.reverse();

      new shell.ShellString(`
import zora from "zora";
${ tests.map((file, i) => `import test${i} from "./${ file.slice(5) }";`).join("\n") }

zora()
${ tests.map((file, i) => `  .test(test${i})`).join("\n") }
  .run();
`).to("test/.index.js");

      const entry = {
        entry: "test/.index.js",
        plugins: [
          json(),
          deps({jsnext: true, preferBuiltins: false}),
          commonjs()
        ]
      };

      const config = {
        dest: "test/.bundle.js",
        format: "iife",
        moduleId: name,
        moduleName: "d3plus"
      };

      rollup.rollup(entry)
        .then(bundle => {
          bundle.write(config);

          shell.exec("cat ./test/.bundle.js | tape-run --render='faucet'", (code, stdout) => {

            shell.rm("test/.index.js");
            shell.rm("test/.bundle.js");
            log.done();
            shell.echo("");
            shell.echo(stdout);
            shell.exit(code);

          });

        })
        .catch(err => {
          log.fail(err);
          log.exit();
          shell.exit(1);
        });

    }
    else {
      log.warn("no tests found");
      log.exit();
      shell.exit(0);
    }

  }

});
