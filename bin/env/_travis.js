const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating .travis.yml");
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

};
