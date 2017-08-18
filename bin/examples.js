#! /usr/bin/env node

/**
    @module d3plus-examples
    @summary Generates example images and HTML.
    @desc Parses any markdown files in the `./example` directory and transforms them into an HTML file usable on the web and takes a screenshot to be used as a thumbnail.
**/

const fs = require("fs"),
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
    @desc Gets a var from markdown header
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
function updatedFile(file) {
  return !shell.exec(`git ls-files ${file}`, {silent: true}).stdout &&
          shell.exec(`git diff ${file}`, {silent: true}).stdout;
}

/**
    @desc Takes a screenshot of an example.
    @private
*/
function ssPromise(file) {

  const contents = shell.cat(file.replace("html", "md")),
        url = `http://localhost:${port}/${file}`;

  const delay = getVar(contents, "delay", 1000),
        height = getVar(contents, "height", 400),
        width = getVar(contents, "width", 990);

  return screenshot({url, width, height, delay, transparent: true})
    .then(img => new Promise(resolve => {
      fs.writeFile(file.replace("html", "png"), img.data, err => {
        if (err) throw err;

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
width: ${width}
height: ${height}
time: ${time.getTime()}
date: ${timeFormat(time)}
---\n\n${mdc}`).to(newFile.replace(".html", "index.md"));
        shell.cp(file.replace("html", "png"), newFile.replace(".html", "thumb.png"));

        resolve(img);

      });

    }));

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

    Promise.all(examples.map(ssPromise)).then(() => {

      screenshot.close();

      if (shell.test("-d", "../d3plus-website")) {
        log.timer("uploading examples to d3plus.org");

        shell.ls("-d", `../d3plus-website/_examples/${name}/*`).forEach(example => {
          const title = example.replace(`../d3plus-website/_examples/${name}/`, "");
          if (!present.includes(title)) shell.rm("-rf", example);
        });

        shell.cd("../d3plus-website");
        shell.exec(`git add _examples/${name}/*`, (code, stdout) => {

          if (code) {
            log.fail();
            server.shutdown();
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

                shell.exec("git push", (code, stdout) => {
                  if (code) {
                    log.fail();
                    shell.echo(stdout);
                  }
                  else log.done();

                  server.shutdown();
                  shell.exit(code);

                });

              }

            });

          }

        });
      }
      else {
        log.warn("d3plus-website repository folder not found in parent directory, builds cannot be uploaded to d3plus.org");
        log.exit();
        server.shutdown();
        shell.exit(0);
      }

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
