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
      - name: Setup xvfb (Linux)
        if: runner.os == 'Linux'
        run: |
          sudo apt-get install -y xvfb libxkbcommon-x11-0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 libxcb-render-util0 libxcb-xinerama0 libxcb-xinput0 libxcb-xfixes0
          # start xvfb in the background
          sudo /usr/bin/Xvfb $DISPLAY -screen 0 1280x1024x24 &
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
