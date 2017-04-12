const chalk = require("chalk"),
      shell = require("shelljs");

module.exports = function(name = "development script") {
  shell.exec("clear");

  shell.echo(`

    ${chalk.bold.green("D3plus 2.0")}
    ${chalk.green(name)}

`);

};
