const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating .npmignore");
  new shell.ShellString(`build/*.zip
example
dev
src
test
.eslintrc
.gitignore
.travis.yml
index.js
npm-debug.log
`).to(".npmignore");

};
