#! /usr/bin/env node

/**
    @module d3plus-examples
    @summary Generates example images and HTML.
    @desc Parses any markdown files in the `./example` directory and transforms them into an HTML file usable on the web and takes a screenshot to be used as a thumbnail.
*/

const execAsync = require("./execAsync"),
      fs = require("fs"),
      log = require("./log")("building examples"),
      port = 4000,
      screenshot = require("electron-screenshot-service"),
      server = require("live-server"),
      shell = require("shelljs"),
      timeFormat = require("d3-time-format").timeFormat("%B %d, %Y");

shell.config.silent = true;
const {name, version} = JSON.parse(shell.cat("package.json"));

let minor = version.split(".");
minor = minor.slice(0, minor.length - 1).join(".");

/**
    @function getVar
    @summary Parses out variables from the top of an example file.
    @param {String} contents File to parse.
    @param {String} key Variable name to look for.
    @param {Number|String} def Default fallback value to use if not found.
    @param {Boolean} [num = true] Whether or not the value should be coerced into a Number.
    @private
*/
function getVar(contents, key, def = 0, num = true) {
  const r = new RegExp(`\\[${key}\\]: ([0-9]+)`, "g").exec(contents);
  return r ? num ? parseFloat(r[1], 10) : r[1] : def;
}

const time = new Date();

/**
    @desc Detects if a file is new or updated.
    @private
*/
function updatedFile() {
  return true;
  // return !shell.exec(`git ls-files ${file}`, {silent: true}).stdout.length ||
  //         shell.exec(`git diff ${file}`, {silent: true}).stdout.length;
}

/**
    @desc Takes a screenshot of an example.
    @private
*/
function screenshotPromise(file) {

  const contents = shell.cat(file.replace("html", "md")),
        url = `http://localhost:${port}/${file}`;

  const delay = getVar(contents, "delay", 2000),
        height = getVar(contents, "height", 400),
        width = getVar(contents, "width", 990);

  return screenshot({url, width, height, delay, transparent: true});

}

/**
    @desc Generates a section of an HTML document based on a markdown code block.
    @private
*/
function addSection(syntax, contents, space = "") {
  const re = new RegExp(`\`\`\`${syntax}\\n((.|\\n)*?)\\n\`\`\``, "g");
  const matches = [];
  let match;
  while ((match = re.exec(contents)) !== null) {
    matches.push(match[1].replace(/\n/g, `\n${space}  `));
  }
  if (syntax === "css") {
    matches.unshift(`body {
${space}    margin: 0;
${space}    overflow: hidden;
${space}  }`);
  }
  if (matches.length) {
    const body = matches.join(`\n\n${space}  `);
    return `

${space}  ${body}

${space}`;
  }
  else return "";
}

if (shell.test("-d", "example")) {

  log.timer("converting markdown to html");
  const examples = [], present = [];
  shell.ls("example/*.md").forEach(file => {

    const contents = shell.cat(file),
          filename = file.replace("md", "html");

    new shell.ShellString(`<!doctype html>
<html>

<head>

  <meta charset="utf-8">
  <script src="../build/${name}.full.min.js"></script>

  <style>${addSection("css", contents, "  ")}</style>

</head>

<body>${addSection("html", contents)}</body>

<script>${addSection("js", contents)}</script>

</html>
`).to(filename);

    present.push(filename.replace("example/", "").replace(".html", ""));
    if (updatedFile(file)) examples.push(filename);

  });

  log.timer("taking screenshots");
  server.start({logLevel: 0, noBrowser: true, port}).on("listening", () => {

    screenshot.scale(examples.length);

    Promise.all(examples.map(screenshotPromise))
      .then(arr => {

        arr.forEach((img, i) => {

          const file = examples[i],
                height = img.size.height,
                pixelRatio = img.size.devicePixelRatio,
                width = img.size.width;

          fs.writeFileSync(file.replace("html", "png"), img.data);
          const slug = file.split("/")[1].replace(".html", "");
          const dir = `../d3plus-website/_examples/${name}/${slug}`;
          shell.mkdir("-p", dir);
          const newFile = file.replace(slug, "").replace("example", dir);

          new shell.ShellString(shell.cat(file)
            .replace("../build", "https://d3plus.org/js")
            .replace("full.min.js", `v${minor}.full.min.js`))
            .to(newFile.replace(".html", "embed.html"));

          const mdc = shell.cat(file.replace("html", "md"));
          const re = new RegExp("# (.*?)\\n", "g");
          let title = re.exec(mdc);
          title = title ? title[1] : "Example";
          new shell.ShellString(`---
  title: ${title}
  width: ${width / pixelRatio}
  height: ${height / pixelRatio}
  time: ${time.getTime()}
  date: ${timeFormat(time)}
  ---\n\n${mdc}`).to(newFile.replace(".html", "index.md"));
          shell.cp(file.replace("html", "png"), newFile.replace(".html", "thumb.png"));
        });

      screenshot.close();

      if (shell.test("-d", "../d3plus-website")) {
        log.timer("uploading examples to d3plus.org");

        shell.ls("-d", `../d3plus-website/_examples/${name}/*`).forEach(example => {
          const title = example.replace(`../d3plus-website/_examples/${name}/`, "");
          if (!present.includes(title)) shell.rm("-rf", example);
        });

        shell.cd("../d3plus-website");

        execAsync(`git add _examples/${name}/*`)
          .then(() => execAsync(`git commit -m \"${name} examples\"`))
          .then(() => execAsync("git push"))
          .then(() => {
            log.done();
            server.shutdown();
            shell.exit(0);
          })
          .catch(err => {
            log.fail(err);
            server.shutdown();
            log.exit();
            shell.exit(1);
          });

      }
      else {
        log.warn("d3plus-website repository folder not found in parent directory, builds cannot be uploaded to d3plus.org");
        log.exit();
        server.shutdown();
        shell.exit(0);
      }

    })
    .catch(err => {
      log.fail(err);
      log.exit();
      shell.exit(1);
    });

  });

}
else {

  if (shell.test("-d", "../d3plus-website")) {
    log.timer("cleaning up website folders");
    shell.rm("-rf", `../d3plus-website/_examples/${name}`);

    shell.cd("../d3plus-website");

    shell.exec(`git add _examples/${name}/*`, (code, stdout) => {
      if (code === 128) {
        log.done();
        shell.cd(`../${name}`);
        log.warn("no examples found matching 'example/*.md' in root");
        log.exit();
        shell.exit(0);
      }
      else if (code) {
        log.fail();
        shell.echo(stdout);
        shell.exit(code);
      }
      else {

        shell.exec(`git commit -m \"${name} examples\"`, code => {

          if (code) {
            log.done();
            shell.exit(0);
          }
          else {

            shell.exec("git push", () => {
              log.done();
              log.exit();
              shell.cd(`../${name}`);
              shell.exit(0);

            });

          }

        });

      }

    });

  }

}
