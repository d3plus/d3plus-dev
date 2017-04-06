#! /usr/bin/env node

const buble = require("rollup-plugin-buble"),
      commonjs = require("rollup-plugin-commonjs"),
      deps = require("rollup-plugin-node-resolve"),
      json = require("rollup-plugin-json"),
      log = require("./log")("testing suite"),
      rollup = require("rollup"),
      shell = require("shelljs"),
      {name} = JSON.parse(shell.cat("package.json"));

log.timer("linting code");
shell.exec("eslint --color index.js bin/*.js bin/**/*.js src/*.js src/**/*.js test/*.js test/**/*.js", {silent: true}, (code, stdout) => {

  if (code) {
    log.fail();
    shell.echo(stdout);
    shell.exit(code);
  }
  else {
    log.done();

    const tests = shell.ls("-R", "test/**/*.js");
    if (tests.length) {

      log.timer("compiling tests");
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
          commonjs(),
          buble({
            exclude: ["node_modules/zora/**", "test/**"]
          })
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

          bundle.write(config)
            .then(() => {

              log.done();
              shell.echo("");

              shell.exec("cat test/.bundle.js | tape-run --render='faucet'", code => {

                shell.rm("test/.index.js");
                shell.rm("test/.bundle.js");
                shell.echo("");
                shell.exit(code);

              });

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
