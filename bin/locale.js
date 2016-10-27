#! /usr/bin/env node

const log = require("./log")("compiling locales"),
      shell = require("shelljs");

log.timer("compiling translations");
shell.exec("i18next .. -r -l en-US,es-ES -f 'locale.t' --fileFilter '*.js' --directoryFilter 'd3plus-*,src' -o ../d3plus-common/src/locales", {silent: true}, (code, stdout) => {
  if (code) log.fail();
  else log.done();
  shell.echo(stdout);
  shell.exit(code);
});
