#! /usr/bin/env node

/**
    @module d3plus-locale
    @summary Parses source code for uses of i18next.
    @desc This script will scan every locally installed d3plus module and construct language JSON for each supported localization.
    @TODO Potentially move this script to d3plus-common?
**/

const log = require("./log")("compiling locales"),
      shell = require("shelljs");

log.timer("compiling translations");
const langs = ["en-US", "es-ES"];
shell.exec(`i18next .. -r -l ${langs.join(",")} -n d3plus -f 'locale.t' --fileFilter '*.js' --directoryFilter 'd3plus-*,src' -o ../d3plus-common/src/locales`, {silent: true}, (code, stdout) => {
  if (code) log.fail();
  else log.done();
  shell.echo(stdout);
  shell.exit(code);
});
