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

    strategy:
      matrix:
        node-version: [14.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Install Dependencies
        run: npm ci
      - name: Lint Code
        run: eslint src test
      - name: Run Tests
        run: mocha 'test/**/*-test.js'
`).to(".github/workflows/NodeCI.yml");

};
