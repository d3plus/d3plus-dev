#! /usr/bin/env node

const log = require("./log")("testing suite"),
      shell = require("shelljs");

log.timer("linting code");
shell.exec("eslint --color index.js bin/*.js src/*.js test/*.js", {silent: true}, (code, stdout) => {

  if (code) {
    log.fail();
    shell.echo(stdout);
    shell.exit(code);
  }
  else {
    log.done();

    if (shell.test("-d", "test")) {
      log.timer("unit and browser tests");
      shell.exec("browserify -t [ babelify --presets [ es2015 ] ] test/*.js | tape-run --render='faucet'", {silent: true}, (code, stdout) => {

        log.done();
        shell.echo("");
        shell.echo(stdout);
        shell.exit(code);

      });
    }
    else {
      log.warn("no tests found");
      log.exit();
      shell.exit(0);
    }

  }

});
