#! /usr/bin/env node
// export GITHUB_TOKEN=xxx
// git config --global credential.helper osxkeychain

/**
    @module d3plus-release
    @summary Publishes a release for a module.
    @desc If the version number in the package.json has been bumped, this script will compile the release, publish it to NPM, update all documentation and examples, and tag and publish release notes on Github.
**/

const asset = require("putasset"),
      {execSync} = require("child_process"),
      release = require("grizzly"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name, version} = JSON.parse(shell.cat("package.json"));

shell.config.silent = true;
const log = require("./log")(`release v${version}`);

let minor = version.split(".");
const prerelease = parseFloat(minor[0]) === 0;
minor = minor.slice(0, minor.length - 1).join(".");

execSync("d3plus-test", {stdio: "inherit"});

const rollup = require("./rollup");

function kill(code, stdout) {
  log.fail();
  shell.echo(stdout);
  shell.exit(code);
}

function finishRelease() {

  log.done();
  execSync("d3plus-examples", {stdio: "inherit"});
  execSync("d3plus-docs", {stdio: "inherit"});

  log.timer("compiling release notes");
  shell.exec("git log --pretty=format:'* %s (%h)' `git describe --tags --abbrev=0`...HEAD", (code, stdout) => {
    const body = stdout;

    log.timer("publishing npm package");
    shell.exec("npm publish ./", (code, stdout) => {
      if (code) kill(code, stdout);

      log.timer("commiting all modified files for release");
      shell.exec("git add --all", (code, stdout) => {
        if (code) kill(code, stdout);

        shell.exec(`git commit -m \"compiles v${version}\"`, (code, stdout) => {
          if (code) kill(code, stdout);

          log.timer("tagging latest commit");
          shell.exec(`git tag v${version}`, (code, stdout) => {
            if (code) kill(code, stdout);

            log.timer("pushing to repository");
            shell.exec("git push origin --follow-tags", (code, stdout) => {
              if (code) kill(code, stdout);

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
                        log.exit();
                        shell.exit(0);
                      }
                    });
                  }
                  else {
                    log.exit();
                    shell.exit(0);
                  }

                }
              });

            });

          });

        });

      });

    });

  });

}

if (shell.test("-d", "src")) {

  rollup().then(() => {
    rollup({deps: true}).then(() => {

      log.timer("uglify builds");
      shell.exec(`uglifyjs build/${name}.js -m --comments -o build/${name}.min.js`, (code, stdout) => {
        if (code) kill(code, stdout);

        shell.exec(`uglifyjs build/${name}.full.js -m --comments -o build/${name}.full.min.js`, (code, stdout) => {
          if (code) kill(code, stdout);

          log.timer("create .zip distribution");
          const files = ["LICENSE", "README.md",
            `build/${name}.js`, `build/${name}.min.js`,
            `build/${name}.full.js`, `build/${name}.full.min.js`
          ];
          shell.exec(`rm -f build/${name}.zip && zip -j -q build/${name}.zip -- ${files.join(" ")}`, (code, stdout) => {
            if (code) kill(code, stdout);

            if (shell.test("-d", "../d3plus-website")) {
              log.timer("uploading builds to d3plus.org");
              shell.cp(`build/${name}.js`, `../d3plus-website/js/${name}.v${minor}.js`);
              shell.cp(`build/${name}.full.js`, `../d3plus-website/js/${name}.v${minor}.full.js`);
              shell.cp(`build/${name}.min.js`, `../d3plus-website/js/${name}.v${minor}.min.js`);
              shell.cp(`build/${name}.full.min.js`, `../d3plus-website/js/${name}.v${minor}.full.min.js`);
              shell.cd("../d3plus-website");
              shell.exec(`git add js/${name}.v${minor}.js js/${name}.v${minor}.min.js js/${name}.v${minor}.full.js js/${name}.v${minor}.full.min.js`, (code, stdout) => {
                if (code) kill(code, stdout);

                shell.exec(`git commit -m \"${name} v${version}\"`, code => {

                  if (code) {
                    shell.cd(`../${name}`);
                    finishRelease();
                  }
                  else {

                    shell.exec("git push", () => {

                      shell.cd(`../${name}`);
                      finishRelease();

                    });

                  }

                });

              });
            }
            else {
              log.done();
              log.warn("d3plus-website repository folder not found in parent directory, builds cannot be uploaded to d3plus.org");
              finishRelease();
            }

          });

        });

      });

    });

  });

}
else finishRelease();
