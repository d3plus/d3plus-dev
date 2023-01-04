const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating Node CI Test Workflow");
  shell.mkdir("-p", ".github");
  shell.mkdir("-p", ".github/workflows");
  new shell.ShellString(`name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Install Node
        uses: actions/setup-node@v3
        with:
          node-version: '12'
      - name: Install Basic Fonts
        run: echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | sudo debconf-set-selections && sudo apt-get install ttf-mscorefonts-installer
      - name: Install Dependencies
        run: npm ci
      - name: Link d3plus-dev Scripts
        run: npm link
      - name: Run Headless Tests
        run: xvfb-run -a npm test
`).to(".github/workflows/NodeCI.yml");

};
