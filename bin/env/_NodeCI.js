const shell = require("shelljs");

module.exports = log => {

  log.timer("creating/updating Node CI Test Workflow");
  shell.mkdir("-p", ".github");
  shell.mkdir("-p", ".github/workflows");
  new shell.ShellString(`name: Node.js CI

on: [push]

jobs:
  build:

    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup xvfb (Linux)
        if: runner.os == 'Linux'
        run: |
          sudo apt-get install -y xvfb libxkbcommon-x11-0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 libxcb-render-util0 libxcb-xinerama0 libxcb-xinput0 libxcb-xfixes0
          # start xvfb in the background
          sudo /usr/bin/Xvfb $DISPLAY -screen 0 1280x1024x24 &
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Install Dependencies
        run: npm ci
      - name: Link d3plus-dev Scripts
        run: npm link
      - name: Run Headless Tests
        uses: GabrielBB/xvfb-action@v1
        with:
          run: npm test
`).to(".github/workflows/NodeCI.yml");

};
