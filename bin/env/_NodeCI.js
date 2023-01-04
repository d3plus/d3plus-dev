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
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [12.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
`).to(".github/workflows/NodeCI.yml");

};
