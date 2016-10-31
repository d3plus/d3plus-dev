const chalk = require("chalk"),
      logo = require("./logo.js"),
      shell = require("shelljs");

module.exports = function(name) {

  if (!process.env.D3PLUS_SCRIPT_LOGO) logo(name);
  process.env.D3PLUS_SCRIPT_LOGO = true;

  const frames = [chalk.dim("█"), chalk.dim("▆"), chalk.dim("▃"), chalk.dim("▆")];
  let interval, message = "";

  this.done = msg => {
    if (msg) message = msg;
    interval = clearInterval(interval);
    shell.echo(`\r[ ${chalk.green("done")} ] ${message}`);
  };

  this.fail = msg => {
    if (msg) message = msg;
    interval = clearInterval(interval);
    shell.echo(`\r[ ${chalk.red("fail")} ] ${message}`);
  };

  this.exit = msg => {
    if (interval) this.done(msg);
    shell.echo(`\n`);
  };

  this.timer = (msg = chalk.gray("please pass a process name to .start()")) => {

    if (interval) this.done();

    message = msg;

    process.stdout.write(`[ ${chalk.dim("wait")} ] ${message}`);

    let tick = 0;

    interval = setInterval(() => {
      const arr = Array(4).fill(" ");
      frames.forEach((f, i) => arr[(i + tick % frames.length) % frames.length] = f);
      process.stdout.write(`\r[ ${arr.join("")} ] ${message}`);
      tick++;
    }, 150);

  };

  this.update = msg => {
    if (msg) message = msg;
    process.stdout.write(`\r[ ${chalk.gray("wait")} ] ${message}`);
  };

  this.warn = msg => {
    if (msg) message = msg;
    interval = clearInterval(interval);
    shell.echo(`\r[ ${chalk.yellow("warn")} ] ${message}`);
  };

  return this;

};
