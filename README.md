# tszip

<!-- ![tsdx](https://user-images.githubusercontent.com/4060187/56918426-fc747600-6a8b-11e9-806d-2da0b49e89e4.png) -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All
Contributors](https://img.shields.io/badge/all_contributors-101-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

*TypeScript to ES Module compiler.*

Use tszip to compile TypeScript libraries, including React components, to 100%
tree-shakeable ESM (**not bundles**).

The [legacy fork](https://npmjs.com/package/@tszip/legacy), which aimed to
guarantee backwards compatibility if that is your goal, is now deprecated
(before ever having been released). If you need CJS interop, which you never
would at the upstream library level, please use that package.

<!-- *Backwards-compatible compiler for TypeScript libraries.*

Use tszip to compile TypeScript libraries, including React components, to 100%
backwards-compatible output. An iteration on
[TSDX](https://github.com/formium/tsdx), tszip output is meant to be lightweight
and, more importantly, *always work* when imported on Node 14+.

This is accomplished largely by: 
  1. emitting `.mjs` and `.cjs` entry-points
  2. emitting a modern ES featureset by default
  3. resolving relative imports in output

Your exports should *just work* out of the box in both ESM and CJS contexts. -->

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Features](#features)
- [Quick Start](#quick-start)
  - [`yarn start`](#yarn-start)
  - [`yarn build`](#yarn-build)
  - [`yarn test`](#yarn-test)
  - [`yarn lint`](#yarn-lint)
  - [`prepare` script](#prepare-script)
- [Customization](#customization)
  - [Rollup](#rollup)
  - [CLI Options](#cli-options)
    - [Example: Adding Postcss](#example-adding-postcss)
  - [Jest](#jest)
  - [ESLint](#eslint)
  - [`patch-package`](#patch-package)
- [Inspiration](#inspiration)
- [API Reference](#api-reference)
  - [`tszip watch`](#tszip-watch)
  - [`tszip build`](#tszip-build)
  - [`tszip test`](#tszip-test)
  - [`tszip lint`](#tszip-lint)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

tszip comes with the "battery-pack included" and is part of a complete
TypeScript breakfast:

- Bundles your code with [Rollup](https://github.com/rollup/rollup) and outputs
  multiple module formats (CJS & ESM by default, and also UMD if you want) plus
  development and production builds
- Comes with treeshaking, ready-to-rock lodash optimizations, and
  minification/compression
- Live reload / watch-mode
- Works with React
- Human readable error messages (and in VSCode-friendly format)
- Bundle size snapshots
- Opt-in to extract `invariant` error codes
- Jest test runner setup with sensible defaults via `tszip test`
- ESLint with Prettier setup with sensible defaults via `tszip lint`
- Zero-config, single dependency
- Escape hatches for customization via `.babelrc.js`, `jest.config.mjs`,
  `.eslintrc`, and `tszip.config.mjs`

## Quick Start

```bash
# install tszip and run `tszip create ...`
npx tszip create --template react mylib
cd mylib && yarn start
```

That's it. You don't need to worry about setting up TypeScript or Rollup or Jest
or other plumbing. Just start editing `src/index.ts` and go!

Below is a list of commands you will probably find useful:

### `yarn start`

Runs the project in development/watch mode. Your project will be rebuilt upon
changes. tszip has a special logger for your convenience. Error messages are
pretty printed and formatted for compatibility VS Code's Problems tab.

<!-- <img
src="https://user-images.githubusercontent.com/4060187/52168303-574d3a00-26f6-11e9-9f3b-71dbec9ebfcb.gif"
width="600" /> -->

Your library will be rebuilt if you make edits.

### `yarn build`

Bundles the package to the `dist` folder. The package is optimized and bundled
with Rollup into multiple formats (CommonJS, UMD, and ES Module).

<!-- <img src="https://user-images.githubusercontent.com/4060187/52168322-a98e5b00-26f6-11e9-8cf6-222d716b75ef.gif" width="600" /> -->

### `yarn test`

Runs your tests using Jest.

### `yarn lint`

Runs Eslint with Prettier on .ts and .tsx files. If you want to customize eslint
you can add an `eslint` block to your package.json, or you can run `yarn lint
--write-file` and edit the generated `.eslintrc` file.

### `prepare` script

Bundles and packages to the `dist` folder. Runs automatically when you run
either `yarn publish`. The `prepare` script will run the
equivalent of `npm run build` or `yarn build`. It will also be run if your
module is installed as a git dependency (ie: `"mymodule":
"github:myuser/mymodule#some-branch"`) so it can be depended on without checking
the transpiled code into git.

## Customization

### Rollup

> **❗⚠️❗ Warning**: <br>
> These modifications will override the default behavior and configuration of
> tszip. As such they can invalidate internal guarantees and assumptions. These
> types of changes can break internal behavior and can be very fragile against
> updates. Use with discretion!

tszip uses Rollup under the hood. The defaults are solid for most packages
(Formik uses the defaults!). However, if you do wish to alter the rollup
configuration, you can do so by creating a file called `tszip.config.mjs` at the
root of your project like so:

```js
// Override the Rollup config.
const tszipConfig = {
  rollup(config, options) {
    return config;
  },
};

export default tszipConfig;
```

### CLI Options
```tsx
export interface TsdxOptions {
  // Override the tsconfig location.
  tsconfig?: string;
  // If true, extract errors.
  extractErrors?: boolean;
  // If true, do not minify.
  noMinify?: boolean;
  // If true, do not type-check.
  transpileOnly?: boolean;
}
```

#### Example: Adding Postcss

```js
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
        inject: false,
        // only write out CSS for the first bundle (avoids pointless extra files):
        extract: !!options.writeMeta,
      })
    );
    return config;
  },
};
```

### Jest

You can add your own `jest.config.mjs` to the root of your project and tszip will
**shallow merge** it with [its own Jest config](./src/createJestConfig.ts).

### ESLint

You can add your own `.eslintrc` to the root of your project and tszip will
**deep merge** it with [its own ESLint config](./src/createEslintConfig.ts).

### `patch-package`

If you still need more customizations, we recommend using
[`patch-package`](https://github.com/ds300/patch-package) so you don't need to
fork. Keep in mind that these types of changes may be quite fragile against
version updates.

## Inspiration

tszip is an iteration on [TSDX](https://github.com/formium/tsdx), which was originally ripped out of
[Formik's](https://github.com/jaredpalmer/formik) build tooling. See
[@developit/microbundle](https://github.com/developit/microbundle) for related
work.

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

### `tszip watch`

```none
Description
  Rebuilds on any change

Usage
  $ tszip watch [options]

Options
  -i, --entry           Entry module
  --target              Specify your target environment  (default web)
  --name                Specify name exposed in UMD builds
  --format              Specify module format(s)  (default cjs,esm)
  --tsconfig            Specify your custom tsconfig path (default <root-folder>/tsconfig.json)
  --verbose             Keep outdated console output in watch mode instead of clearing the screen
  --onFirstSuccess      Run a command on the first successful build
  --onSuccess           Run a command on a successful build
  --onFailure           Run a command on a failed build
  --noClean             Don't clean the dist folder
  --transpileOnly       Skip type checking
  -h, --help            Displays this message

Examples
  $ tszip watch --entry src/foo.tsx
  $ tszip watch --target node
  $ tszip watch --name Foo
  $ tszip watch --format cjs,esm,umd
  $ tszip watch --tsconfig ./tsconfig.foo.json
  $ tszip watch --noClean
  $ tszip watch --onFirstSuccess "echo The first successful build!"
  $ tszip watch --onSuccess "echo Successful build!"
  $ tszip watch --onFailure "echo The build failed!"
  $ tszip watch --transpileOnly
```

### `tszip build`

```none
Description
  Build your project once and exit

Usage
  $ tszip build [options]

Options
  -i, --entry           Entry module
  --target              Specify your target environment  (default web)
  --name                Specify name exposed in UMD builds
  --format              Specify module format(s)  (default cjs,esm)
  --extractErrors       Opt-in to extracting invariant error codes
  --tsconfig            Specify your custom tsconfig path (default <root-folder>/tsconfig.json)
  --transpileOnly       Skip type checking
  -h, --help            Displays this message

Examples
  $ tszip build --entry src/foo.tsx
  $ tszip build --target node
  $ tszip build --name Foo
  $ tszip build --format cjs,esm,umd
  $ tszip build --extractErrors
  $ tszip build --tsconfig ./tsconfig.foo.json
  $ tszip build --transpileOnly
```

### `tszip test`

This runs Jest, forwarding all CLI flags to it. See
[https://jestjs.io](https://jestjs.io) for options. For example, if you would
like to run in watch mode, you can run `tszip test --watch`. So you could set up
your `package.json` `scripts` like:

```json
{
  "scripts": {
    "test": "tszip test",
    "test:watch": "tszip test --watch",
    "test:coverage": "tszip test --coverage"
  }
}
```

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