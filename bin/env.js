#! /usr/bin/env node
// export GITHUB_TOKEN=xxx
// git config --global credential.helper osxkeychain

const LabelSync = require("github-issues-label-sync"),
      eslint = require("./eslint.json"),
      log = require("./log")("environment setup"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name} = JSON.parse(shell.cat("package.json"));



log.timer(".eslintrc");
new shell.ShellString(JSON.stringify(eslint, null, 2)).to(".eslintrc");


log.timer(".gitignore");
new shell.ShellString(`.DS_Store
build/
example/**/*.html
node_modules
npm-debug.log
test/**/*.html
test/**/*.png
test/**/*.json
`).to(".gitignore");


log.timer(".npmignore");
new shell.ShellString(`build/*.zip
example/
test/
.eslintrc
.gitignore
.travis.yml
npm-debug.log
`).to(".npmignore");


log.timer(".travis.yml");
new shell.ShellString(`language: node_js

node_js:
  - "node"

addons:
  apt:
    packages:
      - xvfb

install:
  - export DISPLAY=':99.0'
  - Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
  - npm install
  - npm link

notifications:
  email:
    on_success: never
    on_failure: always
`).to(".travis.yml");


log.timer("LICENSE");
new shell.ShellString(`The MIT License (MIT)

Copyright (c) ${new Date().getFullYear()} D3plus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`).to("LICENSE");



// labeling system inspired by
// https://robinpowered.com/blog/best-practice-system-for-organizing-and-tagging-github-issues/
log.timer("github issue labels");
const labels = [
  {color: "#ee3f46", name: "bug"},

  {color: "#fef2c0", name: "chore"},

  {color: "#ffc274", name: "design"},

  {color: "#91ca55", name: "feature"},

  {color: "#5ebeff", name: "enhancement"},
  {color: "#5ebeff", name: "optimization"},

  {color: "#cc317c", name: "discussion"},
  {color: "#cc317c", name: "question"},

  {color: "#ededed", name: "duplicate"},
  {color: "#ededed", name: "invalid"},
  {color: "#ededed", name: "wontfix"},
  {color: "#ededed", name: "greenkeeper"}
].map(l => ({name: l.name, color: l.color.substring(1)}));

const issueSync = new LabelSync({}, "d3plus", name, token);
issueSync.createLabels(labels)
  .catch(err => {
    log.fail();
    shell.echo(err.toJSON());
    shell.exit(1);
  })
  .then(() => {
    issueSync.updateLabels(labels)
      .then(() => {
        log.exit();
        shell.exit(0);
      })
      .catch(err => {
        log.fail();
        shell.echo(err.toJSON());
        shell.exit(1);
      });
  });
