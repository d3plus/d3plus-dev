#! /usr/bin/env node
// export GITHUB_TOKEN=xxx
// git config --global credential.helper osxkeychain

/**
    @module d3plus-env
    @summary Creates/updates shares repository files and issue labels.
    @desc This script will create all of the repository files shared across d3plus modules, including: ignore files, travis-ci configuration, LICENSE, and github templates. Additionally, this will also standardize the issue labels available on Github.
**/

const eslint = require("./eslintrc.json"),
      log = require("../log")("environment setup"),
      shell = require("shelljs");

log.timer("modifying package.json");
const pkg = JSON.parse(shell.cat("package.json"));
pkg.main = `build/${pkg.name}.full.js`;
pkg.module = "es/index";
pkg["jsnext:main"] = "es/index";
pkg.sideEffects = false;
pkg.files = [
  "bin",
  `build/${pkg.name}.js`,
  `build/${pkg.name}.js.map`,
  `build/${pkg.name}.min.js`,
  "es"
];
new shell.ShellString(`${JSON.stringify(pkg, null, 2)}\n`).to("package.json");

log.timer("creating/updating .eslintrc");
new shell.ShellString(JSON.stringify(eslint, null, 2)).to(".eslintrc");

require("./_gitignore.js")(log);
require("./_LICENSE.js")(log);
require("./_ISSUE_TEMPLATE.js")(log);
require("./_CONTRIBUTING.js")(log);
require("./_NodeCI.js")(log);
require("./_issueLabels.js")(log);

// deprecated files
shell.rm("-f", ".npmignore");
shell.rm("-f", ".travis.yml");
shell.rm("-f", ".github/PULL_REQUEST_TEMPLATE.md");
