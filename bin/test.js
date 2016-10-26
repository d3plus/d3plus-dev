#! /usr/bin/env node

const log = require("./log")("testing suite"),
      shell = require("shelljs");

log.timer("linting code");
const linter = shell.exec("eslint --color index.js bin/*.js src/*.js test/*.js", {silent: true});
if (linter.code) {
  log.fail();
  shell.echo(linter.stdout);
  shell.exit(linter.code);
}
else log.done();

if (shell.test("-d", "test")) {
  log.timer("unit and browser tests");
  const tests = shell.exec("browserify -t [ babelify --presets [ es2015 ] ] test/*.js | tape-run --render='faucet'", {silent: true});
  log.done();
  shell.echo("");
  shell.echo(tests.stdout);
  shell.exit(tests.code);
}
else {
  log.warn("no tests found");
  log.exit();
  shell.exit(0);
}
