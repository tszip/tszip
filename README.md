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
  - [`npm start` or `yarn start`](#npm-start-or-yarn-start)
  - [`npm run build` or `yarn build`](#npm-run-build-or-yarn-build)
  - [`npm test` or `yarn test`](#npm-test-or-yarn-test)
  - [`npm run lint` or `yarn lint`](#npm-run-lint-or-yarn-lint)
  - [`prepare` script](#prepare-script)
- [Customization](#customization)
  - [Rollup](#rollup)
    - [Example: Adding Postcss](#example-adding-postcss)
  - [Jest](#jest)
  - [ESLint](#eslint)
  - [`patch-package`](#patch-package)
- [Inspiration](#inspiration)
  - [Comparison with Microbundle](#comparison-with-microbundle)
- [API Reference](#api-reference)
  - [`tszip watch`](#tszip-watch)
  - [`tszip build`](#tszip-build)
  - [`tszip test`](#tszip-test)
  - [`tszip lint`](#tszip-lint)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)
- [Contributors ✨](#contributors-)

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

Release under the MIT License.

## Contributors ✨

Thanks goes to these wonderful people ([emoji
key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/ctjlewis"><img src="https://avatars.githubusercontent.com/u/1657236?v=4?s=100" width="100px;" alt=""/><br /><sub><b>C. Lewis</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ctjlewis" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=ctjlewis" title="Documentation">📖</a> <a href="#design-ctjlewis" title="Design">🎨</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Actjlewis" title="Reviewed Pull Requests">👀</a> <a href="#tool-ctjlewis" title="Tools">🔧</a> <a href="https://github.com/tszip/tszip/commits?author=ctjlewis" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://jaredpalmer.com"><img src="https://avatars2.githubusercontent.com/u/4060187?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jared Palmer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Documentation">📖</a> <a href="#design-jaredpalmer" title="Design">🎨</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Ajaredpalmer" title="Reviewed Pull Requests">👀</a> <a href="#tool-jaredpalmer" title="Tools">🔧</a> <a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Tests">⚠️</a> <a href="#maintenance-jaredpalmer" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/swyx"><img src="https://avatars1.githubusercontent.com/u/6764957?v=4?s=100" width="100px;" alt=""/><br /><sub><b>swyx</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Asw-yx" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=sw-yx" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=sw-yx" title="Documentation">📖</a> <a href="#design-sw-yx" title="Design">🎨</a> <a href="#ideas-sw-yx" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-sw-yx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-sw-yx" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Asw-yx" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://jasonet.co"><img src="https://avatars1.githubusercontent.com/u/10660468?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jason Etcovitch</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3AJasonEtco" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=JasonEtco" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/skvale"><img src="https://avatars0.githubusercontent.com/u/5314713?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Kvale</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=skvale" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=skvale" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Askvale" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=skvale" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Askvale" title="Reviewed Pull Requests">👀</a> <a href="#ideas-skvale" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-skvale" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://lucaspolito.dev/"><img src="https://avatars3.githubusercontent.com/u/41299650?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lucas Polito</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=lpolito" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=lpolito" title="Documentation">📖</a> <a href="#question-lpolito" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://skalt.github.io"><img src="https://avatars0.githubusercontent.com/u/10438373?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Steven Kalt</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=SKalt" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/harry_hedger"><img src="https://avatars2.githubusercontent.com/u/2524280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Harry Hedger</b></sub></a><br /><a href="#ideas-hedgerh" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/commits?author=hedgerh" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=hedgerh" title="Code">💻</a> <a href="#question-hedgerh" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/arthurdenner"><img src="https://avatars0.githubusercontent.com/u/13774309?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arthur Denner</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aarthurdenner" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=arthurdenner" title="Code">💻</a> <a href="#question-arthurdenner" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://carlfoster.io"><img src="https://avatars2.githubusercontent.com/u/5793483?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Carl</b></sub></a><br /><a href="#ideas-Carl-Foster" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Tests">⚠️</a> <a href="#question-Carl-Foster" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://iGLOO.be"><img src="https://avatars0.githubusercontent.com/u/900947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Loïc Mahieu</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=LoicMahieu" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=LoicMahieu" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/sebald"><img src="https://avatars3.githubusercontent.com/u/985701?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian Sebald</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=sebald" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=sebald" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=sebald" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/karlhorky"><img src="https://avatars2.githubusercontent.com/u/1935696?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Karl Horky</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=karlhorky" title="Documentation">📖</a> <a href="#ideas-karlhorky" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://ghuser.io/jamesgeorge007"><img src="https://avatars2.githubusercontent.com/u/25279263?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James George</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jamesgeorge007" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/agilgur5"><img src="https://avatars3.githubusercontent.com/u/4970083?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anton Gilgur</b></sub></a><br /><a href="#maintenance-agilgur5" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aagilgur5" title="Bug reports">🐛</a> <a href="#example-agilgur5" title="Examples">💡</a> <a href="#ideas-agilgur5" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-agilgur5" title="Answering Questions">💬</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Aagilgur5" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://kylemh.com"><img src="https://avatars1.githubusercontent.com/u/9523719?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Holmberg</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kylemh" title="Code">💻</a> <a href="#example-kylemh" title="Examples">💡</a> <a href="https://github.com/tszip/tszip/commits?author=kylemh" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Akylemh" title="Reviewed Pull Requests">👀</a> <a href="#question-kylemh" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/sisp"><img src="https://avatars1.githubusercontent.com/u/2206639?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sigurd Spieckermann</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Asisp" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=sisp" title="Code">💻</a></td>
    <td align="center"><a href="https://www.selbekk.io"><img src="https://avatars1.githubusercontent.com/u/1307267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kristofer Giltvedt Selbekk</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=selbekk" title="Code">💻</a></td>
    <td align="center"><a href="https://tomasehrlich.cz"><img src="https://avatars2.githubusercontent.com/u/827862?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tomáš Ehrlich</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Atricoder42" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=tricoder42" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kyle-johnson"><img src="https://avatars3.githubusercontent.com/u/1007162?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Johnson</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Akyle-johnson" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=kyle-johnson" title="Code">💻</a></td>
    <td align="center"><a href="http://www.etiennedeladonchamps.fr/"><img src="https://avatars3.githubusercontent.com/u/14336608?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Etienne Dldc</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aetienne-dldc" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=etienne-dldc" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=etienne-dldc" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/fknop"><img src="https://avatars2.githubusercontent.com/u/6775689?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Florian Knop</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Afknop" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/gndelia"><img src="https://avatars1.githubusercontent.com/u/352474?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gonzalo D'Elia</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=gndelia" title="Code">💻</a></td>
    <td align="center"><a href="https://patreon.com/aleclarson"><img src="https://avatars2.githubusercontent.com/u/1925840?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alec Larson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=aleclarson" title="Code">💻</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Aaleclarson" title="Reviewed Pull Requests">👀</a> <a href="#ideas-aleclarson" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-aleclarson" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://cantaloupesys.com/"><img src="https://avatars2.githubusercontent.com/u/277214?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Justin Grant</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ajustingrant" title="Bug reports">🐛</a> <a href="#ideas-justingrant" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-justingrant" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://n3tr.com"><img src="https://avatars3.githubusercontent.com/u/155392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jirat Ki.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=n3tr" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=n3tr" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3An3tr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://natemoo.re"><img src="https://avatars0.githubusercontent.com/u/7118177?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nate Moore</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=natemoo-re" title="Code">💻</a> <a href="#ideas-natemoo-re" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://twitter.com/diegohaz"><img src="https://avatars3.githubusercontent.com/u/3068563?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Haz</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=diegohaz" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://bastibuck.de"><img src="https://avatars1.githubusercontent.com/u/6306291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Basti Buck</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bastibuck" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Abastibuck" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://pablosz.tech"><img src="https://avatars3.githubusercontent.com/u/8672915?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pablo Saez</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=PabloSzx" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3APabloSzx" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.twitter.com/jake_gavin"><img src="https://avatars2.githubusercontent.com/u/5965895?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jake Gavin</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ajakegavin" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=jakegavin" title="Code">💻</a></td>
    <td align="center"><a href="https://grantforrest.dev"><img src="https://avatars1.githubusercontent.com/u/2829772?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Grant Forrest</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=a-type" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=a-type" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aa-type" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://sebastienlorber.com/"><img src="https://avatars0.githubusercontent.com/u/749374?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sébastien Lorber</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=slorber" title="Code">💻</a></td>
    <td align="center"><a href="https://kirjai.com"><img src="https://avatars1.githubusercontent.com/u/9858620?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kirils Ladovs</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kirjai" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/enesTufekci"><img src="https://avatars3.githubusercontent.com/u/16020295?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Enes Tüfekçi</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=enesTufekci" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=enesTufekci" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/IAmTrySound"><img src="https://avatars0.githubusercontent.com/u/5635476?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bogdan Chadkin</b></sub></a><br /><a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3ATrySound" title="Reviewed Pull Requests">👀</a> <a href="#question-TrySound" title="Answering Questions">💬</a> <a href="#ideas-TrySound" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/FredyC"><img src="https://avatars0.githubusercontent.com/u/1096340?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel K.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Tests">⚠️</a> <a href="#ideas-FredyC" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/issues?q=author%3AFredyC" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.quentin-sommer.com"><img src="https://avatars2.githubusercontent.com/u/9129496?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Quentin Sommer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=quentin-sommer" title="Documentation">📖</a></td>
    <td align="center"><a href="https://hyan.com.br"><img src="https://avatars3.githubusercontent.com/u/5044101?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hyan Mandian</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=hyanmandian" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=hyanmandian" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/dance2die"><img src="https://avatars1.githubusercontent.com/u/8465237?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sung M. Kim</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Adance2die" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=dance2die" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/johnrjj"><img src="https://avatars0.githubusercontent.com/u/1103963?v=4?s=100" width="100px;" alt=""/><br /><sub><b>John Johnson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=johnrjj" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=johnrjj" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jooohn"><img src="https://avatars0.githubusercontent.com/u/2661835?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jun Tomioka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jooohn" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=jooohn" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://kunst.com.br"><img src="https://avatars2.githubusercontent.com/u/8649362?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Leonardo Dino</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=leonardodino" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aleonardodino" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://honzabrecka.com"><img src="https://avatars3.githubusercontent.com/u/1021827?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Honza Břečka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=honzabrecka" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Ahonzabrecka" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://chatlayer.ai"><img src="https://avatars1.githubusercontent.com/u/4059732?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ward Loos</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=wrdls" title="Code">💻</a> <a href="#ideas-wrdls" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/bbugh"><img src="https://avatars3.githubusercontent.com/u/438465?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Brian Bugh</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bbugh" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Abbugh" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/ccarse"><img src="https://avatars2.githubusercontent.com/u/1965943?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cody Carse</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ccarse" title="Documentation">📖</a></td>
    <td align="center"><a href="http://sadsa.github.io"><img src="https://avatars0.githubusercontent.com/u/3200576?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh Biddick</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=sadsa" title="Code">💻</a></td>
    <td align="center"><a href="http://albizures.com"><img src="https://avatars3.githubusercontent.com/u/6843073?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Albizures</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=albizures" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=albizures" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aalbizures" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://netzwerg.ch"><img src="https://avatars3.githubusercontent.com/u/439387?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rahel Lüthy</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=netzwerg" title="Documentation">📖</a></td>
    <td align="center"><a href="https://fabulas.io"><img src="https://avatars1.githubusercontent.com/u/14793389?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Edelman </b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=medelman17" title="Code">💻</a> <a href="#ideas-medelman17" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://tunnckoCore.com"><img src="https://avatars3.githubusercontent.com/u/5038030?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Charlike Mike Reagent</b></sub></a><br /><a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3AtunnckoCore" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tszip/tszip/commits?author=tunnckoCore" title="Code">💻</a> <a href="#ideas-tunnckoCore" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/wessberg"><img src="https://avatars0.githubusercontent.com/u/20454213?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Frederik Wessberg</b></sub></a><br /><a href="#question-wessberg" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://elad.ossadon.com"><img src="https://avatars0.githubusercontent.com/u/51488?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Elad Ossadon</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=elado" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=elado" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aelado" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/third774"><img src="https://avatars3.githubusercontent.com/u/8732191?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kevin Kipp</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=third774" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mfolnovic"><img src="https://avatars3.githubusercontent.com/u/20919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matija Folnovic</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=mfolnovic" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=mfolnovic" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Aidurber"><img src="https://avatars1.githubusercontent.com/u/5732291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=Aidurber" title="Code">💻</a></td>
    <td align="center"><a href="http://audiolion.github.io"><img src="https://avatars1.githubusercontent.com/u/2430381?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Castner</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=audiolion" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=audiolion" title="Tests">⚠️</a> <a href="#ideas-audiolion" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/yordis"><img src="https://avatars0.githubusercontent.com/u/4237280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yordis Prieto</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=yordis" title="Code">💻</a></td>
    <td align="center"><a href="http://www.ncphi.com"><img src="https://avatars2.githubusercontent.com/u/824015?v=4?s=100" width="100px;" alt=""/><br /><sub><b>NCPhillips</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ncphillips" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ArnaudBarre"><img src="https://avatars1.githubusercontent.com/u/14235743?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arnaud Barré</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ArnaudBarre" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=ArnaudBarre" title="Documentation">📖</a></td>
    <td align="center"><a href="http://twitter.com/techieshark"><img src="https://avatars2.githubusercontent.com/u/1072292?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter W</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=techieshark" title="Documentation">📖</a></td>
    <td align="center"><a href="http://joeflateau.net"><img src="https://avatars0.githubusercontent.com/u/643331?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joe Flateau</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=joeflateau" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=joeflateau" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://goznauk.github.io"><img src="https://avatars0.githubusercontent.com/u/4438903?v=4?s=100" width="100px;" alt=""/><br /><sub><b>H.John Choi</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=goznauk" title="Documentation">📖</a></td>
    <td align="center"><a href="https://brave.com/loo095"><img src="https://avatars0.githubusercontent.com/u/85355?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jon Stevens</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=lookfirst" title="Documentation">📖</a> <a href="#ideas-lookfirst" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Alookfirst" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/apps/greenkeeper"><img src="https://avatars3.githubusercontent.com/in/505?v=4?s=100" width="100px;" alt=""/><br /><sub><b>greenkeeper[bot]</b></sub></a><br /><a href="#infra-greenkeeper[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tszip/tszip/commits?author=greenkeeper[bot]" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apps/allcontributors"><img src="https://avatars0.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="#infra-allcontributors[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tszip/tszip/commits?author=allcontributors[bot]" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/apps/dependabot"><img src="https://avatars0.githubusercontent.com/in/29110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot[bot]</b></sub></a><br /><a href="#infra-dependabot[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-dependabot[bot]" title="Security">🛡️</a> <a href="https://github.com/tszip/tszip/commits?author=dependabot[bot]" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/about"><img src="https://avatars1.githubusercontent.com/u/9919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>GitHub</b></sub></a><br /><a href="#infra-github" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://linkedin.com/in/ambroseus"><img src="https://avatars0.githubusercontent.com/u/380645?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eugene Samonenko</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ambroseus" title="Tests">⚠️</a> <a href="#example-ambroseus" title="Examples">💡</a> <a href="#question-ambroseus" title="Answering Questions">💬</a> <a href="#ideas-ambroseus" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/rockmandash"><img src="https://avatars2.githubusercontent.com/u/7580792?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joseph Wang</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Arockmandash" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://qiita.com/kotarella1110"><img src="https://avatars1.githubusercontent.com/u/12913947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kotaro Sugawara</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Akotarella1110" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=kotarella1110" title="Code">💻</a></td>
    <td align="center"><a href="https://blog.semesse.me"><img src="https://avatars1.githubusercontent.com/u/13726406?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Semesse</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=Semperia" title="Code">💻</a></td>
    <td align="center"><a href="https://informatikamihelac.com"><img src="https://avatars0.githubusercontent.com/u/13813?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bojan Mihelac</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bmihelac" title="Code">💻</a></td>
    <td align="center"><a href="https://dandascalescu.com/"><img src="https://avatars3.githubusercontent.com/u/33569?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dan Dascalescu</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=dandv" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/yuriy636"><img src="https://avatars3.githubusercontent.com/u/6631050?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yuriy Burychka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=yuriy636" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jssee"><img src="https://avatars1.githubusercontent.com/u/2642936?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jesse Hoyos</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jssee" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/devrelm"><img src="https://avatars0.githubusercontent.com/u/2008333?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mike Deverell</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=devrelm" title="Code">💻</a></td>
    <td align="center"><a href="https://hipsterbrown.com"><img src="https://avatars3.githubusercontent.com/u/3051193?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nick Hehr</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=HipsterBrown" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=HipsterBrown" title="Documentation">📖</a> <a href="#example-HipsterBrown" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Bnaya"><img src="https://avatars0.githubusercontent.com/u/1304862?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bnaya Peretz</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3ABnaya" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=Bnaya" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/andresz1"><img src="https://avatars2.githubusercontent.com/u/6877967?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andres Alvarez</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=andresz1" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=andresz1" title="Documentation">📖</a> <a href="#example-andresz1" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/kyarik"><img src="https://avatars2.githubusercontent.com/u/33955898?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yaroslav K.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kyarik" title="Documentation">📖</a></td>
    <td align="center"><a href="https://strdr4605.github.io"><img src="https://avatars3.githubusercontent.com/u/16056918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dragoș Străinu</b></sub></a><br /><a href="#ideas-strdr4605" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/george-varghese-m/"><img src="https://avatars1.githubusercontent.com/u/20477438?v=4?s=100" width="100px;" alt=""/><br /><sub><b>George Varghese M.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://nelabs.dev/"><img src="https://avatars2.githubusercontent.com/u/137872?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Reinis Ivanovs</b></sub></a><br /><a href="#ideas-slikts" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-slikts" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://orta.io"><img src="https://avatars2.githubusercontent.com/u/49038?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Orta Therox</b></sub></a><br /><a href="#question-orta" title="Answering Questions">💬</a> <a href="https://github.com/tszip/tszip/commits?author=orta" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/thany"><img src="https://avatars1.githubusercontent.com/u/152227?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Martijn Saly</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Athany" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kattcorp.com"><img src="https://avatars1.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Johansson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=KATT" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/hb-seb"><img src="https://avatars1.githubusercontent.com/u/69623566?v=4?s=100" width="100px;" alt=""/><br /><sub><b>hb-seb</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=hb-seb" title="Code">💻</a></td>
    <td align="center"><a href="http://seungdols.tistory.com/"><img src="https://avatars3.githubusercontent.com/u/16032614?v=4?s=100" width="100px;" alt=""/><br /><sub><b>seungdols</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aseungdols" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/CyriacBr"><img src="https://avatars3.githubusercontent.com/u/38442110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Béré Cyriac</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3ACyriacBr" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/in19farkt"><img src="https://avatars3.githubusercontent.com/u/12945918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dmitriy Serdtsev</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ain19farkt" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://formoses.ru/"><img src="https://avatars3.githubusercontent.com/u/3105477?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vladislav Moiseev</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=vladdy-moses" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/felixmosh"><img src="https://avatars3.githubusercontent.com/u/9304194?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Felix Mosheev</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Afelixmosh" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=felixmosh" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.ludofischer.com"><img src="https://avatars1.githubusercontent.com/u/43557?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ludovico Fischer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ludofischer" title="Code">💻</a></td>
    <td align="center"><a href="http://www.altrimbeqiri.com"><img src="https://avatars0.githubusercontent.com/u/602300?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Altrim Beqiri</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aaltrim" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=altrim" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=altrim" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/tanem"><img src="https://avatars3.githubusercontent.com/u/464864?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tane Morgan</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Atanem" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=tanem" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/damassi"><img src="https://avatars.githubusercontent.com/u/236943?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Christopher Pappas</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=damassi" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/pete-redmond-cko"><img src="https://avatars.githubusercontent.com/u/48683566?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pete Redmond</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=pete-redmond-cko" title="Code">💻</a></td>
    <td align="center"><a href="https://samdenty.com/"><img src="https://avatars.githubusercontent.com/u/13242392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Denty</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=samdenty" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xiaoxiaojx"><img src="https://avatars.githubusercontent.com/u/23253540?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shaw</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=xiaoxiaojx" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://jaredpalmer.com"><img src="https://avatars2.githubusercontent.com/u/4060187?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jared Palmer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Documentation">📖</a> <a href="#design-jaredpalmer" title="Design">🎨</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Ajaredpalmer" title="Reviewed Pull Requests">👀</a> <a href="#tool-jaredpalmer" title="Tools">🔧</a> <a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Tests">⚠️</a> <a href="#maintenance-jaredpalmer" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/swyx"><img src="https://avatars1.githubusercontent.com/u/6764957?v=4?s=100" width="100px;" alt=""/><br /><sub><b>swyx</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Asw-yx" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=sw-yx" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=sw-yx" title="Documentation">📖</a> <a href="#design-sw-yx" title="Design">🎨</a> <a href="#ideas-sw-yx" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-sw-yx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-sw-yx" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Asw-yx" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://jasonet.co"><img src="https://avatars1.githubusercontent.com/u/10660468?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jason Etcovitch</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3AJasonEtco" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=JasonEtco" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/skvale"><img src="https://avatars0.githubusercontent.com/u/5314713?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Kvale</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=skvale" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=skvale" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Askvale" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=skvale" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Askvale" title="Reviewed Pull Requests">👀</a> <a href="#ideas-skvale" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-skvale" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://lucaspolito.dev/"><img src="https://avatars3.githubusercontent.com/u/41299650?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lucas Polito</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=lpolito" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=lpolito" title="Documentation">📖</a> <a href="#question-lpolito" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://skalt.github.io"><img src="https://avatars0.githubusercontent.com/u/10438373?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Steven Kalt</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=SKalt" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/harry_hedger"><img src="https://avatars2.githubusercontent.com/u/2524280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Harry Hedger</b></sub></a><br /><a href="#ideas-hedgerh" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/commits?author=hedgerh" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=hedgerh" title="Code">💻</a> <a href="#question-hedgerh" title="Answering Questions">💬</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/arthurdenner"><img src="https://avatars0.githubusercontent.com/u/13774309?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arthur Denner</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aarthurdenner" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=arthurdenner" title="Code">💻</a> <a href="#question-arthurdenner" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://carlfoster.io"><img src="https://avatars2.githubusercontent.com/u/5793483?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Carl</b></sub></a><br /><a href="#ideas-Carl-Foster" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Tests">⚠️</a> <a href="#question-Carl-Foster" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://iGLOO.be"><img src="https://avatars0.githubusercontent.com/u/900947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Loïc Mahieu</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=LoicMahieu" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=LoicMahieu" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/sebald"><img src="https://avatars3.githubusercontent.com/u/985701?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian Sebald</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=sebald" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=sebald" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=sebald" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/karlhorky"><img src="https://avatars2.githubusercontent.com/u/1935696?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Karl Horky</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=karlhorky" title="Documentation">📖</a> <a href="#ideas-karlhorky" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://ghuser.io/jamesgeorge007"><img src="https://avatars2.githubusercontent.com/u/25279263?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James George</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jamesgeorge007" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/agilgur5"><img src="https://avatars3.githubusercontent.com/u/4970083?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anton Gilgur</b></sub></a><br /><a href="#maintenance-agilgur5" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aagilgur5" title="Bug reports">🐛</a> <a href="#example-agilgur5" title="Examples">💡</a> <a href="#ideas-agilgur5" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-agilgur5" title="Answering Questions">💬</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Aagilgur5" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://kylemh.com"><img src="https://avatars1.githubusercontent.com/u/9523719?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Holmberg</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kylemh" title="Code">💻</a> <a href="#example-kylemh" title="Examples">💡</a> <a href="https://github.com/tszip/tszip/commits?author=kylemh" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Akylemh" title="Reviewed Pull Requests">👀</a> <a href="#question-kylemh" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/sisp"><img src="https://avatars1.githubusercontent.com/u/2206639?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sigurd Spieckermann</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Asisp" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=sisp" title="Code">💻</a></td>
    <td align="center"><a href="https://www.selbekk.io"><img src="https://avatars1.githubusercontent.com/u/1307267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kristofer Giltvedt Selbekk</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=selbekk" title="Code">💻</a></td>
    <td align="center"><a href="https://tomasehrlich.cz"><img src="https://avatars2.githubusercontent.com/u/827862?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tomáš Ehrlich</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Atricoder42" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=tricoder42" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kyle-johnson"><img src="https://avatars3.githubusercontent.com/u/1007162?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Johnson</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Akyle-johnson" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=kyle-johnson" title="Code">💻</a></td>
    <td align="center"><a href="http://www.etiennedeladonchamps.fr/"><img src="https://avatars3.githubusercontent.com/u/14336608?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Etienne Dldc</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aetienne-dldc" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=etienne-dldc" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=etienne-dldc" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/fknop"><img src="https://avatars2.githubusercontent.com/u/6775689?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Florian Knop</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Afknop" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/gndelia"><img src="https://avatars1.githubusercontent.com/u/352474?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gonzalo D'Elia</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=gndelia" title="Code">💻</a></td>
    <td align="center"><a href="https://patreon.com/aleclarson"><img src="https://avatars2.githubusercontent.com/u/1925840?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alec Larson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=aleclarson" title="Code">💻</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Aaleclarson" title="Reviewed Pull Requests">👀</a> <a href="#ideas-aleclarson" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-aleclarson" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://cantaloupesys.com/"><img src="https://avatars2.githubusercontent.com/u/277214?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Justin Grant</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ajustingrant" title="Bug reports">🐛</a> <a href="#ideas-justingrant" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-justingrant" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://n3tr.com"><img src="https://avatars3.githubusercontent.com/u/155392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jirat Ki.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=n3tr" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=n3tr" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3An3tr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://natemoo.re"><img src="https://avatars0.githubusercontent.com/u/7118177?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nate Moore</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=natemoo-re" title="Code">💻</a> <a href="#ideas-natemoo-re" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://twitter.com/diegohaz"><img src="https://avatars3.githubusercontent.com/u/3068563?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Haz</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=diegohaz" title="Documentation">📖</a></td>
    <td align="center"><a href="http://bastibuck.de"><img src="https://avatars1.githubusercontent.com/u/6306291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Basti Buck</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bastibuck" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Abastibuck" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://pablosz.tech"><img src="https://avatars3.githubusercontent.com/u/8672915?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pablo Saez</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=PabloSzx" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3APabloSzx" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.twitter.com/jake_gavin"><img src="https://avatars2.githubusercontent.com/u/5965895?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jake Gavin</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ajakegavin" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=jakegavin" title="Code">💻</a></td>
    <td align="center"><a href="https://grantforrest.dev"><img src="https://avatars1.githubusercontent.com/u/2829772?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Grant Forrest</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=a-type" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=a-type" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aa-type" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://sebastienlorber.com/"><img src="https://avatars0.githubusercontent.com/u/749374?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sébastien Lorber</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=slorber" title="Code">💻</a></td>
    <td align="center"><a href="https://kirjai.com"><img src="https://avatars1.githubusercontent.com/u/9858620?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kirils Ladovs</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kirjai" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/enesTufekci"><img src="https://avatars3.githubusercontent.com/u/16020295?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Enes Tüfekçi</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=enesTufekci" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=enesTufekci" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/IAmTrySound"><img src="https://avatars0.githubusercontent.com/u/5635476?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bogdan Chadkin</b></sub></a><br /><a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3ATrySound" title="Reviewed Pull Requests">👀</a> <a href="#question-TrySound" title="Answering Questions">💬</a> <a href="#ideas-TrySound" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/FredyC"><img src="https://avatars0.githubusercontent.com/u/1096340?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel K.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Tests">⚠️</a> <a href="#ideas-FredyC" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/issues?q=author%3AFredyC" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.quentin-sommer.com"><img src="https://avatars2.githubusercontent.com/u/9129496?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Quentin Sommer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=quentin-sommer" title="Documentation">📖</a></td>
    <td align="center"><a href="https://hyan.com.br"><img src="https://avatars3.githubusercontent.com/u/5044101?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hyan Mandian</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=hyanmandian" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=hyanmandian" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/dance2die"><img src="https://avatars1.githubusercontent.com/u/8465237?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sung M. Kim</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Adance2die" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=dance2die" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/johnrjj"><img src="https://avatars0.githubusercontent.com/u/1103963?v=4?s=100" width="100px;" alt=""/><br /><sub><b>John Johnson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=johnrjj" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=johnrjj" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jooohn"><img src="https://avatars0.githubusercontent.com/u/2661835?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jun Tomioka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jooohn" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=jooohn" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://kunst.com.br"><img src="https://avatars2.githubusercontent.com/u/8649362?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Leonardo Dino</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=leonardodino" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aleonardodino" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://honzabrecka.com"><img src="https://avatars3.githubusercontent.com/u/1021827?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Honza Břečka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=honzabrecka" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Ahonzabrecka" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://chatlayer.ai"><img src="https://avatars1.githubusercontent.com/u/4059732?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ward Loos</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=wrdls" title="Code">💻</a> <a href="#ideas-wrdls" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/bbugh"><img src="https://avatars3.githubusercontent.com/u/438465?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Brian Bugh</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bbugh" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Abbugh" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/ccarse"><img src="https://avatars2.githubusercontent.com/u/1965943?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cody Carse</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ccarse" title="Documentation">📖</a></td>
    <td align="center"><a href="http://sadsa.github.io"><img src="https://avatars0.githubusercontent.com/u/3200576?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh Biddick</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=sadsa" title="Code">💻</a></td>
    <td align="center"><a href="http://albizures.com"><img src="https://avatars3.githubusercontent.com/u/6843073?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Albizures</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=albizures" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=albizures" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aalbizures" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://netzwerg.ch"><img src="https://avatars3.githubusercontent.com/u/439387?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rahel Lüthy</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=netzwerg" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://fabulas.io"><img src="https://avatars1.githubusercontent.com/u/14793389?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Edelman </b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=medelman17" title="Code">💻</a> <a href="#ideas-medelman17" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://tunnckoCore.com"><img src="https://avatars3.githubusercontent.com/u/5038030?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Charlike Mike Reagent</b></sub></a><br /><a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3AtunnckoCore" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tszip/tszip/commits?author=tunnckoCore" title="Code">💻</a> <a href="#ideas-tunnckoCore" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/wessberg"><img src="https://avatars0.githubusercontent.com/u/20454213?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Frederik Wessberg</b></sub></a><br /><a href="#question-wessberg" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://elad.ossadon.com"><img src="https://avatars0.githubusercontent.com/u/51488?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Elad Ossadon</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=elado" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=elado" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aelado" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/third774"><img src="https://avatars3.githubusercontent.com/u/8732191?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kevin Kipp</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=third774" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mfolnovic"><img src="https://avatars3.githubusercontent.com/u/20919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matija Folnovic</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=mfolnovic" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=mfolnovic" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Aidurber"><img src="https://avatars1.githubusercontent.com/u/5732291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=Aidurber" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://audiolion.github.io"><img src="https://avatars1.githubusercontent.com/u/2430381?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Castner</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=audiolion" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=audiolion" title="Tests">⚠️</a> <a href="#ideas-audiolion" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/yordis"><img src="https://avatars0.githubusercontent.com/u/4237280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yordis Prieto</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=yordis" title="Code">💻</a></td>
    <td align="center"><a href="http://www.ncphi.com"><img src="https://avatars2.githubusercontent.com/u/824015?v=4?s=100" width="100px;" alt=""/><br /><sub><b>NCPhillips</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ncphillips" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ArnaudBarre"><img src="https://avatars1.githubusercontent.com/u/14235743?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arnaud Barré</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ArnaudBarre" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=ArnaudBarre" title="Documentation">📖</a></td>
    <td align="center"><a href="http://twitter.com/techieshark"><img src="https://avatars2.githubusercontent.com/u/1072292?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter W</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=techieshark" title="Documentation">📖</a></td>
    <td align="center"><a href="http://joeflateau.net"><img src="https://avatars0.githubusercontent.com/u/643331?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joe Flateau</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=joeflateau" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=joeflateau" title="Documentation">📖</a></td>
    <td align="center"><a href="http://goznauk.github.io"><img src="https://avatars0.githubusercontent.com/u/4438903?v=4?s=100" width="100px;" alt=""/><br /><sub><b>H.John Choi</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=goznauk" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://brave.com/loo095"><img src="https://avatars0.githubusercontent.com/u/85355?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jon Stevens</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=lookfirst" title="Documentation">📖</a> <a href="#ideas-lookfirst" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Alookfirst" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/apps/greenkeeper"><img src="https://avatars3.githubusercontent.com/in/505?v=4?s=100" width="100px;" alt=""/><br /><sub><b>greenkeeper[bot]</b></sub></a><br /><a href="#infra-greenkeeper[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tszip/tszip/commits?author=greenkeeper[bot]" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apps/allcontributors"><img src="https://avatars0.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="#infra-allcontributors[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tszip/tszip/commits?author=allcontributors[bot]" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/apps/dependabot"><img src="https://avatars0.githubusercontent.com/in/29110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot[bot]</b></sub></a><br /><a href="#infra-dependabot[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-dependabot[bot]" title="Security">🛡️</a> <a href="https://github.com/tszip/tszip/commits?author=dependabot[bot]" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/about"><img src="https://avatars1.githubusercontent.com/u/9919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>GitHub</b></sub></a><br /><a href="#infra-github" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://linkedin.com/in/ambroseus"><img src="https://avatars0.githubusercontent.com/u/380645?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eugene Samonenko</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ambroseus" title="Tests">⚠️</a> <a href="#example-ambroseus" title="Examples">💡</a> <a href="#question-ambroseus" title="Answering Questions">💬</a> <a href="#ideas-ambroseus" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/rockmandash"><img src="https://avatars2.githubusercontent.com/u/7580792?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joseph Wang</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Arockmandash" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://qiita.com/kotarella1110"><img src="https://avatars1.githubusercontent.com/u/12913947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kotaro Sugawara</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Akotarella1110" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=kotarella1110" title="Code">💻</a></td>
    <td align="center"><a href="https://blog.semesse.me"><img src="https://avatars1.githubusercontent.com/u/13726406?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Semesse</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=Semperia" title="Code">💻</a></td>
    <td align="center"><a href="https://informatikamihelac.com"><img src="https://avatars0.githubusercontent.com/u/13813?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bojan Mihelac</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bmihelac" title="Code">💻</a></td>
    <td align="center"><a href="https://dandascalescu.com/"><img src="https://avatars3.githubusercontent.com/u/33569?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dan Dascalescu</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=dandv" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/yuriy636"><img src="https://avatars3.githubusercontent.com/u/6631050?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yuriy Burychka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=yuriy636" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jssee"><img src="https://avatars1.githubusercontent.com/u/2642936?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jesse Hoyos</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jssee" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/devrelm"><img src="https://avatars0.githubusercontent.com/u/2008333?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mike Deverell</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=devrelm" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://hipsterbrown.com"><img src="https://avatars3.githubusercontent.com/u/3051193?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nick Hehr</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=HipsterBrown" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=HipsterBrown" title="Documentation">📖</a> <a href="#example-HipsterBrown" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Bnaya"><img src="https://avatars0.githubusercontent.com/u/1304862?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bnaya Peretz</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3ABnaya" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=Bnaya" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/andresz1"><img src="https://avatars2.githubusercontent.com/u/6877967?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andres Alvarez</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=andresz1" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=andresz1" title="Documentation">📖</a> <a href="#example-andresz1" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/kyarik"><img src="https://avatars2.githubusercontent.com/u/33955898?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yaroslav K.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kyarik" title="Documentation">📖</a></td>
    <td align="center"><a href="https://strdr4605.github.io"><img src="https://avatars3.githubusercontent.com/u/16056918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dragoș Străinu</b></sub></a><br /><a href="#ideas-strdr4605" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/george-varghese-m/"><img src="https://avatars1.githubusercontent.com/u/20477438?v=4?s=100" width="100px;" alt=""/><br /><sub><b>George Varghese M.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://nelabs.dev/"><img src="https://avatars2.githubusercontent.com/u/137872?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Reinis Ivanovs</b></sub></a><br /><a href="#ideas-slikts" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-slikts" title="Answering Questions">💬</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://orta.io"><img src="https://avatars2.githubusercontent.com/u/49038?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Orta Therox</b></sub></a><br /><a href="#question-orta" title="Answering Questions">💬</a> <a href="https://github.com/tszip/tszip/commits?author=orta" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/thany"><img src="https://avatars1.githubusercontent.com/u/152227?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Martijn Saly</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Athany" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kattcorp.com"><img src="https://avatars1.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Johansson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=KATT" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/hb-seb"><img src="https://avatars1.githubusercontent.com/u/69623566?v=4?s=100" width="100px;" alt=""/><br /><sub><b>hb-seb</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=hb-seb" title="Code">💻</a></td>
    <td align="center"><a href="http://seungdols.tistory.com/"><img src="https://avatars3.githubusercontent.com/u/16032614?v=4?s=100" width="100px;" alt=""/><br /><sub><b>seungdols</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aseungdols" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/CyriacBr"><img src="https://avatars3.githubusercontent.com/u/38442110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Béré Cyriac</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3ACyriacBr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/in19farkt"><img src="https://avatars3.githubusercontent.com/u/12945918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dmitriy Serdtsev</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ain19farkt" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://formoses.ru/"><img src="https://avatars3.githubusercontent.com/u/3105477?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vladislav Moiseev</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=vladdy-moses" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/felixmosh"><img src="https://avatars3.githubusercontent.com/u/9304194?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Felix Mosheev</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Afelixmosh" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=felixmosh" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.ludofischer.com"><img src="https://avatars1.githubusercontent.com/u/43557?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ludovico Fischer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ludofischer" title="Code">💻</a></td>
    <td align="center"><a href="http://www.altrimbeqiri.com"><img src="https://avatars0.githubusercontent.com/u/602300?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Altrim Beqiri</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aaltrim" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=altrim" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=altrim" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/tanem"><img src="https://avatars3.githubusercontent.com/u/464864?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tane Morgan</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Atanem" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=tanem" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ctjlewis"><img src="https://avatars.githubusercontent.com/u/1657236?v=4?s=100" width="100px;" alt=""/><br /><sub><b>C. Lewis</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ctjlewis" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/damassi"><img src="https://avatars.githubusercontent.com/u/236943?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Christopher Pappas</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=damassi" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/pete-redmond-cko"><img src="https://avatars.githubusercontent.com/u/48683566?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pete Redmond</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=pete-redmond-cko" title="Code">💻</a></td>
    <td align="center"><a href="https://samdenty.com/"><img src="https://avatars.githubusercontent.com/u/13242392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Denty</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=samdenty" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xiaoxiaojx"><img src="https://avatars.githubusercontent.com/u/23253540?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shaw</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=xiaoxiaojx" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://jaredpalmer.com"><img src="https://avatars2.githubusercontent.com/u/4060187?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jared Palmer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Documentation">📖</a> <a href="#design-jaredpalmer" title="Design">🎨</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Ajaredpalmer" title="Reviewed Pull Requests">👀</a> <a href="#tool-jaredpalmer" title="Tools">🔧</a> <a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Tests">⚠️</a> <a href="#maintenance-jaredpalmer" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/commits?author=jaredpalmer" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/swyx"><img src="https://avatars1.githubusercontent.com/u/6764957?v=4?s=100" width="100px;" alt=""/><br /><sub><b>swyx</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Asw-yx" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=sw-yx" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=sw-yx" title="Documentation">📖</a> <a href="#design-sw-yx" title="Design">🎨</a> <a href="#ideas-sw-yx" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-sw-yx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-sw-yx" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Asw-yx" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://jasonet.co"><img src="https://avatars1.githubusercontent.com/u/10660468?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jason Etcovitch</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3AJasonEtco" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=JasonEtco" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/skvale"><img src="https://avatars0.githubusercontent.com/u/5314713?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Kvale</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=skvale" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=skvale" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Askvale" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=skvale" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Askvale" title="Reviewed Pull Requests">👀</a> <a href="#ideas-skvale" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-skvale" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://lucaspolito.dev/"><img src="https://avatars3.githubusercontent.com/u/41299650?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lucas Polito</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=lpolito" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=lpolito" title="Documentation">📖</a> <a href="#question-lpolito" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://skalt.github.io"><img src="https://avatars0.githubusercontent.com/u/10438373?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Steven Kalt</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=SKalt" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/harry_hedger"><img src="https://avatars2.githubusercontent.com/u/2524280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Harry Hedger</b></sub></a><br /><a href="#ideas-hedgerh" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/commits?author=hedgerh" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=hedgerh" title="Code">💻</a> <a href="#question-hedgerh" title="Answering Questions">💬</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/arthurdenner"><img src="https://avatars0.githubusercontent.com/u/13774309?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arthur Denner</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aarthurdenner" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=arthurdenner" title="Code">💻</a> <a href="#question-arthurdenner" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://carlfoster.io"><img src="https://avatars2.githubusercontent.com/u/5793483?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Carl</b></sub></a><br /><a href="#ideas-Carl-Foster" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=Carl-Foster" title="Tests">⚠️</a> <a href="#question-Carl-Foster" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://iGLOO.be"><img src="https://avatars0.githubusercontent.com/u/900947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Loïc Mahieu</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=LoicMahieu" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=LoicMahieu" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/sebald"><img src="https://avatars3.githubusercontent.com/u/985701?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian Sebald</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=sebald" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=sebald" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=sebald" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/karlhorky"><img src="https://avatars2.githubusercontent.com/u/1935696?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Karl Horky</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=karlhorky" title="Documentation">📖</a> <a href="#ideas-karlhorky" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://ghuser.io/jamesgeorge007"><img src="https://avatars2.githubusercontent.com/u/25279263?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James George</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jamesgeorge007" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/agilgur5"><img src="https://avatars3.githubusercontent.com/u/4970083?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anton Gilgur</b></sub></a><br /><a href="#maintenance-agilgur5" title="Maintenance">🚧</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aagilgur5" title="Bug reports">🐛</a> <a href="#example-agilgur5" title="Examples">💡</a> <a href="#ideas-agilgur5" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-agilgur5" title="Answering Questions">💬</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Aagilgur5" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tszip/tszip/commits?author=agilgur5" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://kylemh.com"><img src="https://avatars1.githubusercontent.com/u/9523719?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Holmberg</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kylemh" title="Code">💻</a> <a href="#example-kylemh" title="Examples">💡</a> <a href="https://github.com/tszip/tszip/commits?author=kylemh" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Akylemh" title="Reviewed Pull Requests">👀</a> <a href="#question-kylemh" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/sisp"><img src="https://avatars1.githubusercontent.com/u/2206639?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sigurd Spieckermann</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Asisp" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=sisp" title="Code">💻</a></td>
    <td align="center"><a href="https://www.selbekk.io"><img src="https://avatars1.githubusercontent.com/u/1307267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kristofer Giltvedt Selbekk</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=selbekk" title="Code">💻</a></td>
    <td align="center"><a href="https://tomasehrlich.cz"><img src="https://avatars2.githubusercontent.com/u/827862?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tomáš Ehrlich</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Atricoder42" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=tricoder42" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kyle-johnson"><img src="https://avatars3.githubusercontent.com/u/1007162?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Johnson</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Akyle-johnson" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=kyle-johnson" title="Code">💻</a></td>
    <td align="center"><a href="http://www.etiennedeladonchamps.fr/"><img src="https://avatars3.githubusercontent.com/u/14336608?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Etienne Dldc</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aetienne-dldc" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=etienne-dldc" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=etienne-dldc" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/fknop"><img src="https://avatars2.githubusercontent.com/u/6775689?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Florian Knop</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Afknop" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/gndelia"><img src="https://avatars1.githubusercontent.com/u/352474?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gonzalo D'Elia</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=gndelia" title="Code">💻</a></td>
    <td align="center"><a href="https://patreon.com/aleclarson"><img src="https://avatars2.githubusercontent.com/u/1925840?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alec Larson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=aleclarson" title="Code">💻</a> <a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3Aaleclarson" title="Reviewed Pull Requests">👀</a> <a href="#ideas-aleclarson" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-aleclarson" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://cantaloupesys.com/"><img src="https://avatars2.githubusercontent.com/u/277214?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Justin Grant</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ajustingrant" title="Bug reports">🐛</a> <a href="#ideas-justingrant" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-justingrant" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://n3tr.com"><img src="https://avatars3.githubusercontent.com/u/155392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jirat Ki.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=n3tr" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=n3tr" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3An3tr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://natemoo.re"><img src="https://avatars0.githubusercontent.com/u/7118177?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nate Moore</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=natemoo-re" title="Code">💻</a> <a href="#ideas-natemoo-re" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://twitter.com/diegohaz"><img src="https://avatars3.githubusercontent.com/u/3068563?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Haz</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=diegohaz" title="Documentation">📖</a></td>
    <td align="center"><a href="http://bastibuck.de"><img src="https://avatars1.githubusercontent.com/u/6306291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Basti Buck</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bastibuck" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Abastibuck" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://pablosz.tech"><img src="https://avatars3.githubusercontent.com/u/8672915?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pablo Saez</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=PabloSzx" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3APabloSzx" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.twitter.com/jake_gavin"><img src="https://avatars2.githubusercontent.com/u/5965895?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jake Gavin</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ajakegavin" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=jakegavin" title="Code">💻</a></td>
    <td align="center"><a href="https://grantforrest.dev"><img src="https://avatars1.githubusercontent.com/u/2829772?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Grant Forrest</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=a-type" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=a-type" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aa-type" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://sebastienlorber.com/"><img src="https://avatars0.githubusercontent.com/u/749374?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sébastien Lorber</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=slorber" title="Code">💻</a></td>
    <td align="center"><a href="https://kirjai.com"><img src="https://avatars1.githubusercontent.com/u/9858620?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kirils Ladovs</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kirjai" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/enesTufekci"><img src="https://avatars3.githubusercontent.com/u/16020295?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Enes Tüfekçi</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=enesTufekci" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=enesTufekci" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/IAmTrySound"><img src="https://avatars0.githubusercontent.com/u/5635476?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bogdan Chadkin</b></sub></a><br /><a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3ATrySound" title="Reviewed Pull Requests">👀</a> <a href="#question-TrySound" title="Answering Questions">💬</a> <a href="#ideas-TrySound" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/FredyC"><img src="https://avatars0.githubusercontent.com/u/1096340?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel K.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=FredyC" title="Tests">⚠️</a> <a href="#ideas-FredyC" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/issues?q=author%3AFredyC" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.quentin-sommer.com"><img src="https://avatars2.githubusercontent.com/u/9129496?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Quentin Sommer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=quentin-sommer" title="Documentation">📖</a></td>
    <td align="center"><a href="https://hyan.com.br"><img src="https://avatars3.githubusercontent.com/u/5044101?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hyan Mandian</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=hyanmandian" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=hyanmandian" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/dance2die"><img src="https://avatars1.githubusercontent.com/u/8465237?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sung M. Kim</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Adance2die" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=dance2die" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/johnrjj"><img src="https://avatars0.githubusercontent.com/u/1103963?v=4?s=100" width="100px;" alt=""/><br /><sub><b>John Johnson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=johnrjj" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=johnrjj" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jooohn"><img src="https://avatars0.githubusercontent.com/u/2661835?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jun Tomioka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jooohn" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=jooohn" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://kunst.com.br"><img src="https://avatars2.githubusercontent.com/u/8649362?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Leonardo Dino</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=leonardodino" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aleonardodino" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://honzabrecka.com"><img src="https://avatars3.githubusercontent.com/u/1021827?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Honza Břečka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=honzabrecka" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Ahonzabrecka" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://chatlayer.ai"><img src="https://avatars1.githubusercontent.com/u/4059732?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ward Loos</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=wrdls" title="Code">💻</a> <a href="#ideas-wrdls" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/bbugh"><img src="https://avatars3.githubusercontent.com/u/438465?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Brian Bugh</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bbugh" title="Code">💻</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Abbugh" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/ccarse"><img src="https://avatars2.githubusercontent.com/u/1965943?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cody Carse</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ccarse" title="Documentation">📖</a></td>
    <td align="center"><a href="http://sadsa.github.io"><img src="https://avatars0.githubusercontent.com/u/3200576?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh Biddick</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=sadsa" title="Code">💻</a></td>
    <td align="center"><a href="http://albizures.com"><img src="https://avatars3.githubusercontent.com/u/6843073?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Albizures</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=albizures" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=albizures" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aalbizures" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://netzwerg.ch"><img src="https://avatars3.githubusercontent.com/u/439387?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rahel Lüthy</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=netzwerg" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://fabulas.io"><img src="https://avatars1.githubusercontent.com/u/14793389?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Edelman </b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=medelman17" title="Code">💻</a> <a href="#ideas-medelman17" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://tunnckoCore.com"><img src="https://avatars3.githubusercontent.com/u/5038030?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Charlike Mike Reagent</b></sub></a><br /><a href="https://github.com/tszip/tszip/pulls?q=is%3Apr+reviewed-by%3AtunnckoCore" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tszip/tszip/commits?author=tunnckoCore" title="Code">💻</a> <a href="#ideas-tunnckoCore" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/wessberg"><img src="https://avatars0.githubusercontent.com/u/20454213?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Frederik Wessberg</b></sub></a><br /><a href="#question-wessberg" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://elad.ossadon.com"><img src="https://avatars0.githubusercontent.com/u/51488?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Elad Ossadon</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=elado" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=elado" title="Tests">⚠️</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Aelado" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/third774"><img src="https://avatars3.githubusercontent.com/u/8732191?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kevin Kipp</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=third774" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mfolnovic"><img src="https://avatars3.githubusercontent.com/u/20919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matija Folnovic</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=mfolnovic" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=mfolnovic" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Aidurber"><img src="https://avatars1.githubusercontent.com/u/5732291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=Aidurber" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://audiolion.github.io"><img src="https://avatars1.githubusercontent.com/u/2430381?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Castner</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=audiolion" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=audiolion" title="Tests">⚠️</a> <a href="#ideas-audiolion" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/yordis"><img src="https://avatars0.githubusercontent.com/u/4237280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yordis Prieto</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=yordis" title="Code">💻</a></td>
    <td align="center"><a href="http://www.ncphi.com"><img src="https://avatars2.githubusercontent.com/u/824015?v=4?s=100" width="100px;" alt=""/><br /><sub><b>NCPhillips</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ncphillips" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ArnaudBarre"><img src="https://avatars1.githubusercontent.com/u/14235743?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arnaud Barré</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ArnaudBarre" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=ArnaudBarre" title="Documentation">📖</a></td>
    <td align="center"><a href="http://twitter.com/techieshark"><img src="https://avatars2.githubusercontent.com/u/1072292?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter W</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=techieshark" title="Documentation">📖</a></td>
    <td align="center"><a href="http://joeflateau.net"><img src="https://avatars0.githubusercontent.com/u/643331?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joe Flateau</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=joeflateau" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=joeflateau" title="Documentation">📖</a></td>
    <td align="center"><a href="http://goznauk.github.io"><img src="https://avatars0.githubusercontent.com/u/4438903?v=4?s=100" width="100px;" alt=""/><br /><sub><b>H.John Choi</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=goznauk" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://brave.com/loo095"><img src="https://avatars0.githubusercontent.com/u/85355?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jon Stevens</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=lookfirst" title="Documentation">📖</a> <a href="#ideas-lookfirst" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tszip/tszip/issues?q=author%3Alookfirst" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/apps/greenkeeper"><img src="https://avatars3.githubusercontent.com/in/505?v=4?s=100" width="100px;" alt=""/><br /><sub><b>greenkeeper[bot]</b></sub></a><br /><a href="#infra-greenkeeper[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tszip/tszip/commits?author=greenkeeper[bot]" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apps/allcontributors"><img src="https://avatars0.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="#infra-allcontributors[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tszip/tszip/commits?author=allcontributors[bot]" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/apps/dependabot"><img src="https://avatars0.githubusercontent.com/in/29110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot[bot]</b></sub></a><br /><a href="#infra-dependabot[bot]" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-dependabot[bot]" title="Security">🛡️</a> <a href="https://github.com/tszip/tszip/commits?author=dependabot[bot]" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/about"><img src="https://avatars1.githubusercontent.com/u/9919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>GitHub</b></sub></a><br /><a href="#infra-github" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://linkedin.com/in/ambroseus"><img src="https://avatars0.githubusercontent.com/u/380645?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eugene Samonenko</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ambroseus" title="Tests">⚠️</a> <a href="#example-ambroseus" title="Examples">💡</a> <a href="#question-ambroseus" title="Answering Questions">💬</a> <a href="#ideas-ambroseus" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/rockmandash"><img src="https://avatars2.githubusercontent.com/u/7580792?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joseph Wang</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Arockmandash" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://qiita.com/kotarella1110"><img src="https://avatars1.githubusercontent.com/u/12913947?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kotaro Sugawara</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Akotarella1110" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=kotarella1110" title="Code">💻</a></td>
    <td align="center"><a href="https://blog.semesse.me"><img src="https://avatars1.githubusercontent.com/u/13726406?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Semesse</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=Semperia" title="Code">💻</a></td>
    <td align="center"><a href="https://informatikamihelac.com"><img src="https://avatars0.githubusercontent.com/u/13813?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bojan Mihelac</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=bmihelac" title="Code">💻</a></td>
    <td align="center"><a href="https://dandascalescu.com/"><img src="https://avatars3.githubusercontent.com/u/33569?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dan Dascalescu</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=dandv" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/yuriy636"><img src="https://avatars3.githubusercontent.com/u/6631050?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yuriy Burychka</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=yuriy636" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jssee"><img src="https://avatars1.githubusercontent.com/u/2642936?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jesse Hoyos</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=jssee" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/devrelm"><img src="https://avatars0.githubusercontent.com/u/2008333?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mike Deverell</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=devrelm" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://hipsterbrown.com"><img src="https://avatars3.githubusercontent.com/u/3051193?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nick Hehr</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=HipsterBrown" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=HipsterBrown" title="Documentation">📖</a> <a href="#example-HipsterBrown" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Bnaya"><img src="https://avatars0.githubusercontent.com/u/1304862?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bnaya Peretz</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3ABnaya" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=Bnaya" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/andresz1"><img src="https://avatars2.githubusercontent.com/u/6877967?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andres Alvarez</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=andresz1" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=andresz1" title="Documentation">📖</a> <a href="#example-andresz1" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/kyarik"><img src="https://avatars2.githubusercontent.com/u/33955898?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yaroslav K.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=kyarik" title="Documentation">📖</a></td>
    <td align="center"><a href="https://strdr4605.github.io"><img src="https://avatars3.githubusercontent.com/u/16056918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dragoș Străinu</b></sub></a><br /><a href="#ideas-strdr4605" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/george-varghese-m/"><img src="https://avatars1.githubusercontent.com/u/20477438?v=4?s=100" width="100px;" alt=""/><br /><sub><b>George Varghese M.</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Documentation">📖</a> <a href="https://github.com/tszip/tszip/commits?author=georgevarghese185" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://nelabs.dev/"><img src="https://avatars2.githubusercontent.com/u/137872?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Reinis Ivanovs</b></sub></a><br /><a href="#ideas-slikts" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-slikts" title="Answering Questions">💬</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://orta.io"><img src="https://avatars2.githubusercontent.com/u/49038?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Orta Therox</b></sub></a><br /><a href="#question-orta" title="Answering Questions">💬</a> <a href="https://github.com/tszip/tszip/commits?author=orta" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/thany"><img src="https://avatars1.githubusercontent.com/u/152227?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Martijn Saly</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Athany" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kattcorp.com"><img src="https://avatars1.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Johansson</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=KATT" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/hb-seb"><img src="https://avatars1.githubusercontent.com/u/69623566?v=4?s=100" width="100px;" alt=""/><br /><sub><b>hb-seb</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=hb-seb" title="Code">💻</a></td>
    <td align="center"><a href="http://seungdols.tistory.com/"><img src="https://avatars3.githubusercontent.com/u/16032614?v=4?s=100" width="100px;" alt=""/><br /><sub><b>seungdols</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aseungdols" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/CyriacBr"><img src="https://avatars3.githubusercontent.com/u/38442110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Béré Cyriac</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3ACyriacBr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/in19farkt"><img src="https://avatars3.githubusercontent.com/u/12945918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dmitriy Serdtsev</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Ain19farkt" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://formoses.ru/"><img src="https://avatars3.githubusercontent.com/u/3105477?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vladislav Moiseev</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=vladdy-moses" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/felixmosh"><img src="https://avatars3.githubusercontent.com/u/9304194?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Felix Mosheev</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Afelixmosh" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=felixmosh" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.ludofischer.com"><img src="https://avatars1.githubusercontent.com/u/43557?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ludovico Fischer</b></sub></a><br /><a href="https://github.com/tszip/tszip/commits?author=ludofischer" title="Code">💻</a></td>
    <td align="center"><a href="http://www.altrimbeqiri.com"><img src="https://avatars0.githubusercontent.com/u/602300?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Altrim Beqiri</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Aaltrim" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=altrim" title="Code">💻</a> <a href="https://github.com/tszip/tszip/commits?author=altrim" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/tanem"><img src="https://avatars3.githubusercontent.com/u/464864?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tane Morgan</b></sub></a><br /><a href="https://github.com/tszip/tszip/issues?q=author%3Atanem" title="Bug reports">🐛</a> <a href="https://github.com/tszip/tszip/commits?author=tanem" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!
