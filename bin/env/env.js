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

log.timer("creating/updating .eslintrc");
new shell.ShellString(JSON.stringify(eslint, null, 2)).to(".eslintrc");

require("./_gitignore.js")(log);
require("./_npmignore.js")(log);
require("./_travis.js")(log);
require("./_LICENSE.js")(log);
require("./_ISSUE_TEMPLATE.js")(log);
require("./_PULL_REQUEST_TEMPLATE.js")(log);
require("./_CONTRIBUTING.js")(log);
require("./_issueLabels.js")(log);
