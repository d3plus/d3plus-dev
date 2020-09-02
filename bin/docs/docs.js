#! /usr/bin/env node

/**
    @module d3plus-docs
    @summary Generates documentation based on code comments.
    @desc Generates the READEME.md documentation based on the JSDoc comments in the codebase. This script will overwrite README.md, but will not do any interaction with Github (commit, push, etc).
*/

const {Octokit} = require("@octokit/rest"),
      jsdoc2md = require("jsdoc-to-markdown"),
      log = require("../log")("documentation"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN;

shell.config.silent = true;
const {description, name, version} = JSON.parse(shell.cat("package.json"));

const versions = version.split(".").map(Number);
const minor = versions.slice(0, versions.length - 1).join(".");
const nextMajor = `${versions[0] + 1}.0`;
// const nextMinor = `${versions[0]}.${versions[1] + 1}`;

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

log.timer("detecting upcoming releases");

const github = new Octokit({auth: token});

github.projects
  .listForRepo({owner: "d3plus", repo: name})
  .then(res => {
    const projects = res.data.filter(p => p.name === nextMajor);
    if (projects.length) {
      github.projects
        .listColumns({project_id: projects[0].id})
        .then(res => {
          Promise.all(res.data.map(c => github.projects.listCards({column_id: c.id}).then(res => res.data)))
            .then(columns => {
              const total = columns[0].length + columns[1].length + columns[2].length;
              const complete = columns[2].length;
              const percent = complete / total;
              const color = percent === 1 ? "brightgreen"
                : percent > 0.9 ? "green"
                : percent > 0.75 ? "yellowgreen"
                : percent > 0.5 ? "yellow"
                : percent > 0.25 ? "orange"
                : "red";
              finishDocs(`[![${nextMajor} progress](https://img.shields.io/badge/${nextMajor}_progress-${Math.round(percent * 100)}%25-${color}.svg?style=flat)](${projects[0].html_url})`);
            });
        });
    }
    else finishDocs("");
  });


/**

*/
function finishDocs(progress) {

  let examples = "";

  if (shell.test("-d", "example")) {

    log.timer("analyzing example directory");

    let header = false;

    if (shell.test("-f", "example/getting-started.md")) {

      const contents = shell.cat("example/getting-started.md"),
            width = getVar(contents, "width", 990);

      const link = `https://d3plus.org/examples/${name}/getting-started/`;
      header = `${contents}

[<kbd><img src="/example/getting-started.png" width="${width}px" /></kbd>](${link})

[Click here](${link}) to view this example live on the web.


`;
      header = header.replace(/\n# |^# /g, "\n## ");

    }

    const now = new Date().getTime(), week = 1000 * 60 * 60 * 24 * 7;
    const addl = shell.ls("-l", "example/*.md")
      .filter(f => !f.name.includes("getting-started.md"))
      .sort((a, b) => b.birthtime - a.birthtime)
      .map(file => {
        const re = new RegExp("# (.*?)\\n", "g");
        const h1 = re.exec(shell.cat(file.name));
        const title = h1 ? h1[1] : file.name.replace("example/", "").replace(".md", "");
        const url = `http://d3plus.org/${file.name.replace("example", `examples/${name}`).replace(".md", "/")}`;
        const suffix = now - file.ctime < week ? "<sup> ***New***</sup>"
          : now - file.mtime < week ? "<sup> ***Updated***</sup>" : "";
        return ` * [${title}](${url})${suffix}`;
      });

    if (!header && addl.length) header = "## Examples\n";
    else if (addl.length) header = `${header}### More Examples\n`;

    if (header) examples = `${header}\n${addl.join("\n")}\n`;

  }

  log.timer("writing JSDOC comments to README.md");

  const docs = shell.cat(`${__dirname}/partials/docs.hbs`),
        toc = shell.cat(`${__dirname}/partials/toc.hbs`);

  const template = `${shell.tempdir()}/README.hbs`;

  const contents = `# ${name}

[![NPM Release](http://img.shields.io/npm/v/${name}.svg?style=flat)](https://www.npmjs.org/package/${name}) [![Build Status](https://travis-ci.org/d3plus/${name}.svg?branch=master)](https://travis-ci.org/d3plus/${name}) [![Dependency Status](http://img.shields.io/david/d3plus/${name}.svg?style=flat)](https://david-dm.org/d3plus/${name}) [![Gitter](https://img.shields.io/badge/-chat_on_gitter-brightgreen.svg?style=flat&logo=gitter-white)](https://gitter.im/d3plus/) ${progress}

${description}

## Installing

If you use NPM, run \`npm install ${name} --save\`. Otherwise, download the [latest release](https://github.com/d3plus/${name}/releases/latest). The released bundle supports AMD, CommonJS, and vanilla environments. You can also load directly from [d3plus.org](https://d3plus.org):

\`\`\`html
<script src="https://d3plus.org/js/${name}.v${minor}.full.min.js"></script>
\`\`\`

${examples}
## API Reference

${toc}

---

${docs}

###### <sub>Documentation generated on {{currentDate}}</sub>
`;
  new shell.ShellString(contents).to(template);

  /**
      @function errorHandler
      @summary Handles exec/promise errors.
      @param {Function} [cb] Callback function.
      @private
  */
  function errorHandler(cb) {

    return (code, stdout) => {

      if (code) {
        log.fail();
        shell.echo(stdout);
        shell.exit(code);
      }
      else if (cb) cb(code, stdout);
      else {
        log.exit();
        shell.exit(0);
      }

    };
  }

  const jsdocConfig = `--separators --helper ${ __dirname }/helpers.js --partial '${ __dirname }/partials/*.hbs'`;
  shell.exec(`jsdoc2md '+(bin|src)/**/*.+(js|jsx)' ${jsdocConfig} -t ${ template } > README.md`, errorHandler(() => {

    shell.exec("git add README.md && git commit -m \"updates documentation\" && git push", () => {

      if (shell.test("-d", "../d3plus-website") && !["react", "website", "workshop"].includes(name.split("-")[1])) {

        log.timer("compiling website documentation");
        const templateData = jsdoc2md.getTemplateDataSync({files: "+(bin|src)/**/*.+(js|jsx)"});

        templateData.forEach(data => {
          const {access, kind, memberof, name} = data;
          if (!["constructor", "external", "module", "typedef"].includes(kind) && memberof === undefined && access !== "private") {
            const docTemplate = `{{#${kind} name="${name}"}}{{>website}}{{/${kind}}}`;
            const output = jsdoc2md.renderSync({
              data: templateData,
              helper: `${ __dirname }/helpers.js`,
              partial: `${ __dirname }/partials/*.hbs`,
              separators: true,
              template: docTemplate
            }).replace(/https:\/\/github\.com\/d3plus\/d3plus-[a-z]+#/g, "#");
            shell.mkdir("-p", `../d3plus-website/_docs/${kind}`);
            new shell.ShellString(`---
name: ${name}
kind: ${kind}
---

  ${output}`).to(`../d3plus-website/_docs/${kind}/${name}.md`);
          }
        });

        shell.cd("../d3plus-website");
        shell.exec(`git add _docs/* && git commit -m \"updates ${name} documentation\" && git push`, () => {

          log.exit();
          shell.exit(0);

        });

      }
      else {
        log.exit();
        shell.exit(0);
      }

    });

  }));

}
