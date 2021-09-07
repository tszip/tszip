<h1 style="display: flex; flex-direction: column; align-items: center;">
  <span style="display: flex;justify-content: center;align-items: flex-end;">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" width="4rem" height="4rem" fill="none" version="1.1" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="50" fill="#3178c6"></rect>
      <path d="m317 407v50c8.1 4.2 18 7.3 29 9.4s23 3.1 35 3.1c12 0 23-1.1 34-3.4 11-2.3 20-6.1 28-11 8.1-5.3 15-12 19-21s7.1-19 7.1-32c0-9.1-1.4-17-4.1-24s-6.6-13-12-18c-5.1-5.3-11-10-18-14s-15-8.2-24-12c-6.6-2.7-12-5.3-18-7.9-5.2-2.6-9.7-5.2-13-7.8-3.7-2.7-6.5-5.5-8.5-8.4-2-3-3-6.3-3-10 0-3.4 0.89-6.5 2.7-9.3s4.3-5.1 7.5-7.1c3.2-2 7.2-3.5 12-4.6 4.7-1.1 9.9-1.6 16-1.6 4.2 0 8.6 0.31 13 0.94 4.6 0.63 9.3 1.6 14 2.9 4.7 1.3 9.3 2.9 14 4.9 4.4 2 8.5 4.3 12 6.9v-47c-7.6-2.9-16-5.1-25-6.5s-19-2.1-31-2.1c-12 0-23 1.3-34 3.8s-20 6.5-28 12c-8.1 5.4-14 12-19 21-4.7 8.4-7 18-7 30 0 15 4.3 28 13 38 8.6 11 22 19 39 27 6.9 2.8 13 5.6 19 8.3s11 5.5 15 8.4c4.3 2.9 7.7 6.1 10 9.5 2.5 3.4 3.8 7.4 3.8 12 0 3.2-0.78 6.2-2.3 9s-3.9 5.2-7.1 7.2-7.1 3.6-12 4.8c-4.7 1.1-10 1.7-17 1.7-11 0-22-1.9-32-5.7-11-3.8-21-9.5-30-17zm-84-123h64v-41h-179v41h64v183h51z" clip-rule="evenodd" fill="#fff" fill-rule="evenodd" style="fill:#fff"></path>
    </svg>
    <i style="padding-left: 4px;line-height: 1.0;">zip</i>
  </span>
  <span style="font-weight: normal;padding: 12px 0;font-size: 1.5rem;">(Preview)</span>
</h1>

<!-- ![tsdx](https://user-images.githubusercontent.com/4060187/56918426-fc747600-6a8b-11e9-806d-2da0b49e89e4.png) -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All
Contributors](https://img.shields.io/badge/all_contributors-101-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

*TypeScript to ES Module compiler.*

Use tszip to compile TypeScript libraries, including React components, written
in ESNext to 100% tree-shakeable ES module packages (*not* bundles). Please see
the [**Usage**](#Usage) section for an overview of how this works.

The [legacy fork](https://npmjs.com/package/@tszip/legacy), which aimed to
guarantee backwards compatibility if that is your goal, is now deprecated
(before ever having been released). If you need CJS interop, which you never
would at the upstream library level, please use that package.

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
- [Usage](#usage)
  - [ESNext input](#esnext-input)
    - [Note regarding CJS interop](#note-regarding-cjs-interop)
  - [Internal vs. external entry points](#internal-vs-external-entry-points)
- [Commands](#commands)
  - [`yarn boot`](#yarn-boot)
  - [`yarn dev`](#yarn-dev)
  - [`yarn build`](#yarn-build)
  - [`yarn test`](#yarn-test)
  - [`yarn lint`](#yarn-lint)
  - [`prepare` script](#prepare-script)
- [Customization](#customization)
  - [Jest](#jest)
  - [ESLint](#eslint)
- [Inspiration](#inspiration)
- [API Reference](#api-reference)
  - [`tszip dev`](#tszip-dev)
  - [`tszip build`](#tszip-build)
  - [`tszip test`](#tszip-test)
  - [`tszip lint`](#tszip-lint)
- [Contributing](#contributing)
- [License](#license)
- [Attribution](#attribution)
- [Footnotes](#footnotes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

```bash
# install tszip globally
yarn global add tszip

# create a package
tszip create $PACKAGE_NAME

# enter package
cd $PACKAGE_NAME

# start watching
tszip dev

# when finished developing, build final bundle
tszip build
```

## Usage

This tool is used to compile TS and JS libraries, i.e. it bundles modules and
exposes them for import by others downstream.

### ESNext input

tszip projects are able to use the full range of features offered by ESNext,
including top-level `await` and `import`¹. For backwards compatibility,
`require` is shimmed using `createRequire(import.meta.url)`².

#### Note regarding CJS interop

TypeScript's `esModuleInterop` logic cannot map named imports for some CJS
modules (e.g., `chalk`), in which case you may rely on synthetic default
imports:

```ts
// fails at runtime
import { green } from 'chalk'
console.log(green('hello world'))

// use synthetic default for CJS modules
import chalk from 'chalk'
console.log(chalk.green('hello world'))
```

### Internal vs. external entry points

**An import from `your-package/path/to/submodule` only works if
`src/path/to/submodule` is a folder with an `index` file.**

tszip projects leverage package.json `exports` logic to automatically resolve
subdir imports for your package, which mimics something like an optimized
version of legacy `resolve()` logic.

Consider the following typical project structure:

```none
src
├── a
│   ├── index.ts
│   └── utils.ts
├── b
│   ├── index.ts
│   └── utils.ts
├── c
│   ├── index.ts
│   ├── subpath
│   │   └── index.ts
│   └── utils.ts
├── constants.ts
├── index.ts
└── utils.ts

```

tszip will build this same project structure in `dist/` (at  `dist/a/index.js`,
`dist/a/utils.js`, and so on).  The exports configuration provides for the
following behavior:

  - modules at `index` files:
      - `your-package/index.js`
      - `your-package/a/index.js`
      - `your-package/b/index.js`, etc.

    can be imported easily via:
      - `your-package`
      - `your-package/a`
      - `your-package/b`, etc.

  - whereas non-`index` files:
      - `your-package/constants.js`
      - `your-package/a/utils.js`
      - `your-package/b/utils.js`, etc.

    cannot be imported, though can still be exposed by re-exporting at an index.

Output in `dist/` takes the following form and maps to the following import
specifiers (type declarations and sourcemaps omitted):

```none
dist
├── a
│   ├── index.js      ➞  your-package/a
│   └── utils.js
├── b
│   ├── index.js      ➞  your-package/b
│   └── utils.js
├── c
│   ├── index.js      ➞  your-package/c
│   ├── subpath
│   │   └── index.js      ➞  your-package/c/subpath
│   └── utils.js
├── constants.js
├── index.js          ➞  your-package
└── utils.js
```

The main result is that `index` files are said to be **external** in that you
can import them from another ES module, and non-`index` files are **internal**
in that they are emitted as output, but cannot be imported without re-exporting
at an index.

See the following examples, where `your-package` is the name of the package in
package.json:

```ts
/** This is a downstream module importing your package. */

// your-package is always exported as the root index
import { whatever } from 'your-package'

// your-package/a is an index file, and is exported
import { whatever } from 'your-package/a'

// error! this entry point is not an index, and is not exported
import { whatever } from 'your-package/a/utils'
```

This logic is an efficient compromise given the way Node.js resolves the
`exports` field: https://github.com/nodejs/node/issues/39994

See the Node.js docs for more info about conditional exports:
https://nodejs.org/api/packages.html#packages_subpath_patterns

## Commands

### `yarn boot`

This is an escape hatch to build an executable (but unoptimized) version of your
project without using tszip involved (only TSC and Rollup). Can be used for
debugging if there are errors in the output emitted by `tszip build`.

### `yarn dev`

Runs the project in development/watch mode, automatically compiling and
refreshing on changes.

### `yarn build`

Runs the release build process and compiles optimized output to `dist/`.

<!-- <img src="https://user-images.githubusercontent.com/4060187/52168322-a98e5b00-26f6-11e9-8cf6-222d716b75ef.gif" width="600" /> -->

### `yarn test`

Runs your tests using Jest.

### `yarn lint`

Runs Eslint with Prettier on .ts and .tsx files. If you want to customize eslint
you can add an `eslint` block to your package.json, or you can run `yarn lint
--write-file` and edit the generated `.eslintrc` file.

### `prepare` script

Bundles and packages to the `dist` folder. Runs automatically when you run
either `yarn publish`. The `prepare` script will run the equivalent of `npm run
build` or `yarn build`. It will also be run if your module is installed as a git
dependency (ie: `"mymodule": "github:myuser/mymodule#some-branch"`) so it can be
depended on without checking the transpiled code into git.

## Customization
### Jest

You can add your own `jest.config.js` to the root of your project and tszip
will **shallow merge** it with [its own Jest config](./src/createJestConfig.ts).

### ESLint

You can add your own `.eslintrc` to the root of your project and tszip will
**deep merge** it with [its own ESLint config](./src/createEslintConfig.ts).

## Inspiration

tszip is an iteration on [TSDX](https://github.com/formium/tsdx), which was
originally ripped out of [Formik's](https://github.com/jaredpalmer/formik) build
tooling. See [@developit/microbundle](https://github.com/developit/microbundle)
for related work.

<!-- ### Comparison with Microbundle

Some key differences include:

- tszip includes out-of-the-box test running via Jest
- tszip includes out-of-the-box linting and formatting via ESLint and Prettier
- tszip includes a bootstrap command with a few package templates
- tszip allows for some lightweight customization
- tszip is TypeScript focused, but also supports plain JavaScript
- tszip outputs distinct development and production builds (like React does) for
  CJS and UMD builds. This means you can include rich error messages and other
  dev-friendly goodies without sacrificing final bundle size. -->

## API Reference

### `tszip dev`

```none
Description
  Compile package and listen for changes.

Usage
  $ tszip dev [options]

Options
  -h, --help    Displays this message
```

### `tszip build`

```none
Description
  Create the release build for the package.

Usage
  $ tszip build [options]

Options
  --noMinify         Do not minify output.
  --transpileOnly    Only transpile TS, do not typecheck.
  -h, --help         Displays this message
```

### `tszip test`

This runs Jest, forwarding all CLI flags to it. See
[https://jestjs.io](https://jestjs.io) for options. 

### `tszip lint`

```none
Description
  Run eslint with Prettier

Usage
  $ tszip lint [options]

Options
  --fix               Fixes fixable errors and warnings
  --ignore-pattern    Ignore a pattern
  --max-warnings      Exits with non-zero error code if number of warnings exceed this number  (default Infinity)
  --write-file        Write the config file locally
  --report-file       Write JSON report to file locally
  -h, --help          Displays this message

Examples
  $ tszip lint src
  $ tszip lint src --fix
  $ tszip lint src test --ignore-pattern test/foo.ts
  $ tszip lint src test --max-warnings 10
  $ tszip lint src --write-file
  $ tszip lint src --report-file report.json
```

## Contributing

Please see the [Contributing Guidelines](./CONTRIBUTING.md).

## License

Released under the MIT License.

## Attribution

Emojis thanks to [Twemoji by Twitter](https://twemoji.twitter.com/). See
[twitter/twemoji](https://github.com/twitter/twemoji) for the full source code.

---

## Footnotes

¹ Because of multiple competing standards (CJS, ESM, etc.), eventually,
consumers of packages may need to transpile code to older featuresets (even
pre-ES2015) in order for them to work in certain contexts.

However, there is no need for this to be done upstream, nor to develop modern
packages on anything other than ESNext to take full advantage of new
improvements in the language and ES module resolution logic.

² This works identically to legacy behavior only because each entry point is
mapped to a transpiled version of itself. Default Rollup behavior of compiling
all code to a single output bundle would break this assumption and make shimming
`require` impossible.

*Note (9/7/2021): `require` is now shimmed only for the Rollup process, rather
than once per-file, but this documentation may be needed in the future in case
this logic is re-implemented.*