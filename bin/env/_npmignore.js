const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating .npmignore");
  new shell.ShellString(`build/*.zip
example/
test/
.eslintrc
.gitignore
.travis.yml
npm-debug.log
`).to(".npmignore");

};
