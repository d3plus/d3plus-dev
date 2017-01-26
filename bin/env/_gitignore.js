const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating .gitignore");
  new shell.ShellString(`.DS_Store
build
dev
example/**/*.html
node_modules
npm-debug.log
`).to(".gitignore");

};
