# d3plus-dev

[![NPM Release](http://img.shields.io/npm/v/d3plus-dev.svg?style=flat)](https://www.npmjs.org/package/d3plus-dev) [![Build Status](https://travis-ci.org/d3plus/d3plus-dev.svg?branch=master)](https://travis-ci.org/d3plus/d3plus-dev) [![Dependency Status](http://img.shields.io/david/d3plus/d3plus-dev.svg?style=flat)](https://david-dm.org/d3plus/d3plus-dev) [![Gitter](https://img.shields.io/badge/-chat_on_gitter-brightgreen.svg?style=flat&logo=gitter-white)](https://gitter.im/d3plus/)

A collection of scripts for developing D3plus modules.

## Installing

If you use NPM, `npm install d3plus-dev`. Otherwise, download the [latest release](https://github.com/d3plus/d3plus-dev/releases/latest). You can also load d3plus-dev as a standalone library or as part of [D3plus](https://github.com/d3plus/d3plus). ES modules, AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3plus` global is exported:

```html
<script src="https://cdn.jsdelivr.net/npm/d3plus-dev@1"></script>
<script>
  console.log(d3plus);
</script>
```


## API Reference

##### Scripts
* [d3plus-build](#module_d3plus-build) - Compiles all files for distribution.
* [d3plus-dev](#module_d3plus-dev) - Spins up the development environment.
* [d3plus-docs](#module_d3plus-docs) - Generates documentation based on code comments.
* [d3plus-env](#module_d3plus-env) - Creates/updates shares repository files and issue labels.
* [d3plus-examples](#module_d3plus-examples) - Generates example images and HTML.
* [d3plus-release](#module_d3plus-release) - Publishes a release for a module.
* [d3plus-test](#module_d3plus-test) - Runs linting and unit/browser tests on source files.
---

<a name="module_d3plus-build"></a>
#### **d3plus-build** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/build.js#L3)

This script will compile 2 builds, one with all dependencies includes (full) and one with only the core code. Next, each of those builds is minified using uglifyjs. Finally, all those builds, along with the LICENSE and README, are compressed into a .zip file.


This is a script accessible from the node environment.

---

<a name="module_d3plus-dev"></a>
#### **d3plus-dev** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/dev.js#L3)

Initializes the development server, which will open a connection on `localhost:4000` and continuously watch the `./src` directory for file changes. When a change is detected, it will rebundle the full javascript build and refresh any open web browsers.


This is a script accessible from the node environment.

---

<a name="module_d3plus-docs"></a>
#### **d3plus-docs** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/docs/docs.js#L3)

Generates the READEME.md documentation based on the JSDoc comments in the codebase. This script will overwrite README.md, but will not do any interaction with Github (commit, push, etc).


This is a script accessible from the node environment.

---

<a name="module_d3plus-env"></a>
#### **d3plus-env** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/env/env.js#L5)

This script will create all of the repository files shared across d3plus modules, including: ignore files, travis-ci configuration, LICENSE, and github templates. Additionally, this will also standardize the issue labels available on Github.


This is a script accessible from the node environment.

---

<a name="module_d3plus-examples"></a>
#### **d3plus-examples** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/examples.js#L3)

Parses any markdown files in the `./example` directory and transforms them into an HTML file usable on the web and takes a screenshot to be used as a thumbnail.


This is a script accessible from the node environment.

---

<a name="module_d3plus-release"></a>
#### **d3plus-release** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/release.js#L5)

If the version number in the package.json has been bumped, this script will compile the release, publish it to NPM, update all documentation and examples, and tag and publish release notes on Github.


This is a script accessible from the node environment.

---

<a name="module_d3plus-test"></a>
#### **d3plus-test** [<>](https://github.com/d3plus/d3plus-dev/blob/master/bin/test.js#L3)

Based on the .eslintrc file provided by the [d3plus-env](#module_d3plus-env) script, all source files will be linted and then passed to any browser/unit tests that have been written.


This is a script accessible from the node environment.

---



###### <sub>Documentation generated on Tue, 02 Feb 2021 00:23:41 GMT</sub>
