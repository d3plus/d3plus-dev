const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating ISSUE_TEMPLATE.md");
  shell.mkdir("-p", ".github");
  new shell.ShellString(`<!-- If possible, please recreate your issue in a JSFiddle. -->

<!-- You can use this template to get started: -->
<!-- https://jsfiddle.net/davelandry/u7dfeop0/ -->

<!-- Please remove as many unrelated methods until the bug is still reproducible. -->

`).to(".github/ISSUE_TEMPLATE.md");

};
