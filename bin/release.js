#! /usr/bin/env node
// export GITHUB_TOKEN=xxx
// git config --global credential.helper osxkeychain

const asset = require("putasset"),
      release = require("grizzly"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name, version} = JSON.parse(shell.cat("package.json"));

shell.config.silent = true;
const log = require("./log")(`release v${version}`);

let minor = version.split(".");
const prerelease = parseFloat(minor[0]) === 0;
minor = minor.slice(0, minor.length - 1).join(".");

const tests = shell.exec("d3plus-test", {silent: false});
if (tests.code) shell.exit(tests.code);

const rollup = require("./rollup");

function finishRelease() {

  log.timer("compiling examples");
  const ex = shell.exec("d3plus-examples");
  if (ex.code) {
    log.fail();
    shell.exit(ex.code);
  }

  log.timer("compiling documentation");
  const docs = shell.exec("d3plus-docs");
  if (docs.code) {
    log.fail();
    shell.exit(docs.code);
  }

  log.timer("compiling release notes");
  const body = shell.exec("git log --pretty=format:'* %s (%h)' `git describe --tags --abbrev=0`...HEAD").stdout;

  log.timer("publishing npm package");
  const pub = shell.exec("npm publish ./");
  if (pub.code) {
    log.fail();
    shell.exit(pub.code);
  }

  log.timer("commiting all modified files for release");
  const add = shell.exec("git add --all");
  if (add.code) {
    log.fail();
    shell.exit(add.code);
  }
  const commit = shell.exec(`git commit -m \"compiles v${version}\"`);
  if (commit.code) {
    log.fail();
    shell.exit(commit.code);
  }

  log.timer("tagging latest commit");
  const tag = shell.exec(`git tag v${version}`);
  if (tag.code) {
    log.fail();
    shell.exit(tag.code);
  }

  log.timer("pushing to repository");
  const push = shell.exec("git push origin --follow-tags");
  if (push.code) {
    log.fail();
    shell.exit(push.code);
  }

  log.timer("publishing release notes");
  release(token, {
    repo: name,
    user: "d3plus",
    tag: `v${version}`,
    name: `v${version}`,
    body, prerelease
  }, error => {
    if (error) {
      log.fail();
      shell.echo(`repo: ${name}`);
      shell.echo(`tag/name: v${version}`);
      shell.echo(`body: ${body}`);
      shell.echo(`prerelease: ${prerelease}`);
      shell.echo(error.message);
      shell.exit(1);
    }
    else {

      if (shell.test("-f", `build/${name}.zip`)) {
        log.timer("attaching .zip distribution to release");
        asset(token, {
          repo: name,
          owner: "d3plus",
          tag: `v${version}`,
          filename: `build/${name}.zip`
        }, error => {
          if (error) {
            log.fail();
            shell.echo(error.message);
            shell.exit(1);
          }
          else {
            log.done();
            shell.exit(0);
          }
        });
      }
      else {
        log.done();
        shell.exit(0);
      }

    }
  });

}

if (shell.test("-d", "src")) {

  rollup().then(() => {
    rollup({deps: true}).then(() => {

      log.timer("uglify builds");
      shell.exec(`uglifyjs build/${name}.js -m --comments -o build/${name}.min.js`);
      shell.exec(`uglifyjs build/${name}.full.js -m --comments -o build/${name}.full.min.js`);

      log.timer("create .zip distribution");
      shell.exec(`rm -f build/${name}.zip && zip -j -q build/${name}.zip -- LICENSE README.md build/${name}.js build/${name}.min.js build/${name}.full.js build/${name}.full.min.js`);

      if (shell.test("-d", "../d3plus-website")) {
        log.timer("uploading builds to d3plus.org");
        shell.cp(`build/${name}.js`, `../d3plus-website/js/${name}.v${minor}.js`);
        shell.cp(`build/${name}.full.js`, `../d3plus-website/js/${name}.v${minor}.full.js`);
        shell.cp(`build/${name}.min.js`, `../d3plus-website/js/${name}.v${minor}.min.js`);
        shell.cp(`build/${name}.full.min.js`, `../d3plus-website/js/${name}.v${minor}.full.min.js`);
        shell.cd("../d3plus-website");
        shell.exec(`git add js/${name}.v${minor}.js js/${name}.v${minor}.min.js js/${name}.v${minor}.full.js js/${name}.v${minor}.full.min.js`);
        shell.exec(`git commit -m \"${name} v${version}\"`);
        shell.exec("git push -q");
        shell.cd("-");
      }
      else {
        log.done();
        log.warn("d3plus-website repository folder not found in parent directory, builds cannot be uploaded to d3plus.org");
      }

      finishRelease();

    });
  });

}
else finishRelease();
