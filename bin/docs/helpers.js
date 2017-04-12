const shell = require("shelljs");
const {name} = JSON.parse(shell.cat("package.json"));

exports.currentDate = () => new Date().toUTCString();

exports.codeLink = meta => {
  const {filename, lineno, path} = meta;
  let folders = path.split("/");
  const index = folders.indexOf(name);
  folders = folders.slice(index + 1);
  return `[<>](https://github.com/d3plus/${name}/blob/master${ folders.length ? `/${folders.join("/")}` : "" }/${filename}#L${lineno})`;
};
