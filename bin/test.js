#! /usr/bin/env node

/**
    @module d3plus-test
    @summary Runs linting and unit/browser tests on source files.
    @desc Based on the .eslintrc file provided by the [d3plus-env](#module_d3plus-env) script, all source files will be linted and then passed to any browser/unit tests that have been written.
**/

const babel = require("rollup-plugin-babel"),
      commonjs = require("rollup-plugin-commonjs"),
      deps = require("rollup-plugin-node-resolve"),
      execAsync = require("./execAsync"),
      json = require("rollup-plugin-json"),
      log = require("./log")("testing suite"),
      rollup = require("rollup"),
      shell = require("shelljs"),
      {name} = JSON.parse(shell.cat("package.json"));

log.timer("linting code");

execAsync("eslint --color index.js \"?(src|test)/**/*.js\"", {silent: true})
  .then(stdout => {

    log.done();
    shell.echo(stdout);

    shell.config.silent = true;
    const tests = shell.ls("-R", "test/**/*.js");
    shell.config.silent = false;

    if (tests.length) {

      log.timer("compiling tests");
      tests.reverse();

      const testIndex = tests
        .map((file, i) => `import test${i} from "./${ file.slice(5) }";\nconsole.log(test${i});`)
        .join("\n");

      new shell.ShellString(testIndex)
        .to("test/.index.js");

      const input = {
        input: "test/.index.js",
        onwarn: e => {
          switch (e.code) {
            case "CIRCULAR_DEPENDENCY":
              return undefined;
            case "ERROR":
            case "FATAL":
              log.fail();
              shell.echo(`bundle error in '${e.error.id}':`);
              return shell.echo(e.error);
            default:
              return undefined;
          }
        },
        plugins: [
          json(),
          deps({mainFields: ["jsnext:main", "module", "main"], preferBuiltins: false}),
          commonjs(),
          babel({
            configFile: `${__dirname}/.babelrc`,
            exclude: ["node_modules/zora/**", "test/**"]
          })
        ]
      };

      const output = {
        amd: {id: name},
        file: "test/.bundle.js",
        format: "iife",
        name: "d3plus"
      };

      rollup.rollup(input)
        .then(bundle => bundle.write(output))
        .then(() => {

          log.done();
          shell.echo("");

          return execAsync("cat test/.bundle.js | tape-run --render='faucet'");

        })
        .then(() => {

          shell.rm("test/.index.js");
          shell.rm("test/.bundle.js");
          shell.echo("");
          shell.exit(0);

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

  })
  .catch((err, code) => {
    log.fail(err);
    log.exit();
    shell.exit(code);
  });
