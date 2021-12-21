#! /usr/bin/env node

/**
    @module d3plus-docs
    @summary Generates documentation based on code comments.
    @desc Generates the READEME.md documentation based on the JSDoc comments in the codebase. This script will overwrite README.md, but will not do any interaction with Github (commit, push, etc).
*/

const log = require("../log")("documentation"),
      shell = require("shelljs");

shell.config.silent = true;
const {description, name, version} = JSON.parse(shell.cat("package.json"));

const versions = version.split(".").map(Number);
const major = versions[0];

log.timer("writing JSDOC comments to README.md");

const docs = shell.cat(`${__dirname}/partials/docs.hbs`),
      toc = shell.cat(`${__dirname}/partials/toc.hbs`);

const template = `${shell.tempdir()}/README.hbs`;

const contents = `# ${name}

[![NPM Release](http://img.shields.io/npm/v/${name}.svg?style=flat)](https://www.npmjs.org/package/${name}) [![Build Status](https://travis-ci.org/d3plus/${name}.svg?branch=master)](https://travis-ci.org/d3plus/${name}) [![Dependency Status](http://img.shields.io/david/d3plus/${name}.svg?style=flat)](https://david-dm.org/d3plus/${name}) [![Gitter](https://img.shields.io/badge/-chat_on_gitter-brightgreen.svg?style=flat&logo=gitter-white)](https://gitter.im/d3plus/)

${description}

## Installing

If you use NPM, \`npm install ${name}\`. Otherwise, download the [latest release](https://github.com/d3plus/${name}/releases/latest). You can also load ${name} as a standalone library or as part of [D3plus](https://github.com/d3plus/d3plus). ES modules, AMD, CommonJS, and vanilla environments are supported. In vanilla, a \`d3plus\` global is exported:

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/${name}@${major}"></script>
<script>
  console.log(d3plus);
</script>
\`\`\`

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

    log.exit();
    shell.exit(0);

  });

}));
