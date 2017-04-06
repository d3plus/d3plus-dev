#! /usr/bin/env node
// export GITHUB_TOKEN=xxx
// git config --global credential.helper osxkeychain

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
