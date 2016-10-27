const chalk = require("chalk"),
      shell = require("shelljs");

module.exports = function(name = "", mode) {

  switch (mode) {

    case "ascii":

      const pad = 25;
      name = `${Array(pad).fill(" ").join("")}${name.toUpperCase()}`.slice(-pad);

      shell.echo(`
       ${chalk.dim("▄▄▄▄▄▄▄▄          ▄▄▄▄▄▄   ")}
       ${chalk.dim("█       ▀▀▄    ▄▀▀      ▀▀▄")}
       ${chalk.dim("█          ▀▄  █          █")}  ${chalk.green("         ▄▄")}
       ${chalk.dim("█           █  ▀         ▄▀")}  ${chalk.green("         ██")}
       ${chalk.dim("█           █       ▀▀▀▀▀▄ ")}  ${chalk.green("██▀▀▀█▄  ██ ██   ██ ▄█▀▀▀▀▄")}
       ${chalk.dim("█           █  █          █")}  ${chalk.green("██    ██ ██ ██   ██ ▀█▄▄▄")}
       ${chalk.dim("█        ▄▄▀   █          █")}  ${chalk.green("██    ██ ██ ██   ██    ▀▀█▄")}
       ${chalk.dim("█▄▄▄▄▄▄▀▀       ▀▀▄▄▄▄▄▄▀▀ ")}  ${chalk.green("██▄▄▄█▀  ██ ▀█▄▄▀██ ▀▄▄▄▄█▀")}
                                    ${chalk.green("██")}
                                    ${chalk.green("██")}${chalk.black(name)}

      `);

      break;

    default:
      shell.echo(`
    ${chalk.bold.black("D3")}${chalk.bold.green("plus")}
    ${chalk.dim(name)}

`);

  }

};
