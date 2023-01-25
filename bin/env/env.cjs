#! /usr/bin/env node
// export GITHUB_TOKEN=xxx
// git config --global credential.helper osxkeychain

/**
    @module d3plus-env
    @summary Creates/updates shares repository files and issue labels.
    @desc This script will create all of the repository files shared across d3plus modules, including: ignore files, travis-ci configuration, LICENSE, and github templates. Additionally, this will also standardize the issue labels available on Github.
**/

const log = require("../log.cjs")("environment setup"),
      shell = require("shelljs");

log.timer("modifying package.json");
const pkg = JSON.parse(shell.cat("package.json"));
pkg.module = "es/index.js";
pkg.main = "es/index.js";
pkg.jsdelivr = `build/${pkg.name}.full.min.js`;
pkg.unpkg = `build/${pkg.name}.full.min.js`;

pkg.sideEffects = false;
pkg.type = "module";
pkg.files = [
  "bin",
  `build/${pkg.name}.js`,
  `build/${pkg.name}.js.map`,
  `build/${pkg.name}.min.js`,
  "es"
];
pkg.scripts = {
  build: "d3plus-build",
  dev: "d3plus-dev",
  docs: "d3plus-docs",
  env: "d3plus-env",
  release: "d3plus-release",
  test: "eslint src test && mocha 'test/**/*-test.js'"
};
new shell.ShellString(`${JSON.stringify(pkg, null, 2)}\n`).to("package.json");

log.timer("creating/updating .eslintrc");
const eslint = require("./eslintrc.json");
new shell.ShellString(JSON.stringify(eslint, null, 2)).to(".eslintrc");

log.timer("creating/updating test/.eslintrc");
shell.mkdir("-p", "test");
const eslintTest = require("./eslintrc-test.json");
new shell.ShellString(JSON.stringify(eslintTest, null, 2)).to("test/.eslintrc");

require("./_jsdom.cjs")(log);
require("./_gitignore.cjs")(log);
require("./_LICENSE.cjs")(log);
require("./_ISSUE_TEMPLATE.cjs")(log);
require("./_CONTRIBUTING.cjs")(log);
require("./_NodeCI.cjs")(log);
require("./_issueLabels.cjs")(log);

// deprecated files
shell.rm("-f", ".npmignore");
shell.rm("-f", ".travis.yml");
shell.rm("-f", ".github/PULL_REQUEST_TEMPLATE.md");
