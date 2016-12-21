const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating .gitignore");
  new shell.ShellString(`.DS_Store
build/
example/**/*.html
node_modules
npm-debug.log
test/**/*.html
test/**/*.png
test/**/*.json
`).to(".gitignore");

};
