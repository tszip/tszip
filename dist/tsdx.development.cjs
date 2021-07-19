'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sade = require('sade');
var glob = require('tiny-glob/sync.js');
var rollup = require('rollup');
var asyncro = require('asyncro');
var chalk = require('chalk');
var jest = require('jest');
var eslint = require('eslint');
var path = require('path');
var execa = require('execa');
var shell = require('shelljs');
var ora = require('ora');
var semver = require('semver');
var fs = require('fs-extra');
var camelCase = require('camelcase');
require('ansi-escapes');
var jpjs = require('jpjs');
var rollupPluginTerser = require('rollup-plugin-terser');
var core = require('@babel/core');
var commonjs = require('@rollup/plugin-commonjs');
var json = require('@rollup/plugin-json');
var replace = require('@rollup/plugin-replace');
var resolve = require('@rollup/plugin-node-resolve');
var sourceMaps = require('rollup-plugin-sourcemaps');
var typescript = require('rollup-plugin-typescript2');
var ts = require('typescript');
var parser = require('@babel/parser');
var traverse = require('@babel/traverse');
var pascalCase = require('pascal-case');
var pluginBabel = require('@rollup/plugin-babel');
var merge = require('lodash.merge');
var rollupPlugin = require('@optimize-lodash/rollup-plugin');
var fs$1 = require('fs');
var Input = require('enquirer/lib/prompts/input.js');
var Select = require('enquirer/lib/prompts/select.js');
var progressEstimator = require('progress-estimator');
var promises = require('fs/promises');
require('@babel/helper-module-imports');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return n;
}

var sade__default = /*#__PURE__*/_interopDefaultLegacy(sade);
var glob__default = /*#__PURE__*/_interopDefaultLegacy(glob);
var asyncro__default = /*#__PURE__*/_interopDefaultLegacy(asyncro);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var jest__default = /*#__PURE__*/_interopDefaultLegacy(jest);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var execa__default = /*#__PURE__*/_interopDefaultLegacy(execa);
var shell__default = /*#__PURE__*/_interopDefaultLegacy(shell);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var semver__default = /*#__PURE__*/_interopDefaultLegacy(semver);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var camelCase__default = /*#__PURE__*/_interopDefaultLegacy(camelCase);
var commonjs__default = /*#__PURE__*/_interopDefaultLegacy(commonjs);
var json__default = /*#__PURE__*/_interopDefaultLegacy(json);
var replace__default = /*#__PURE__*/_interopDefaultLegacy(replace);
var resolve__default = /*#__PURE__*/_interopDefaultLegacy(resolve);
var sourceMaps__default = /*#__PURE__*/_interopDefaultLegacy(sourceMaps);
var typescript__default = /*#__PURE__*/_interopDefaultLegacy(typescript);
var ts__default = /*#__PURE__*/_interopDefaultLegacy(ts);
var traverse__default = /*#__PURE__*/_interopDefaultLegacy(traverse);
var merge__default = /*#__PURE__*/_interopDefaultLegacy(merge);
var Input__default = /*#__PURE__*/_interopDefaultLegacy(Input);
var Select__default = /*#__PURE__*/_interopDefaultLegacy(Select);
var progressEstimator__default = /*#__PURE__*/_interopDefaultLegacy(progressEstimator);

const stderr = console.error.bind(console);
function logError(err) {
    const error = err.error || err;
    const description = `${error.name ? error.name + ': ' : ''}${error.message ||
        error}`;
    const message = error.plugin
        ? error.plugin === 'rpt2'
            ? `(typescript) ${description}`
            : `(${error.plugin} plugin) ${description}`
        : description;
    stderr(chalk__default['default'].bold.red(message));
    if (error.loc) {
        stderr();
        stderr(`at ${error.loc.file}:${error.loc.line}:${error.loc.column}`);
    }
    if (error.frame) {
        stderr();
        stderr(chalk__default['default'].dim(error.frame));
    }
    else if (err.stack) {
        const headlessStack = error.stack.replace(message, '');
        stderr(chalk__default['default'].dim(headlessStack));
    }
    stderr();
}

// Remove the package name scope if it exists
const removeScope = (name) => name.replace(/^@.*\//, '');
// UMD-safe package name
const safeVariableName = (name) => camelCase__default['default'](removeScope(name)
    .toLowerCase()
    .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, ''));
const safePackageName = (name) => name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
const external = (id) => !id.startsWith('.') && !path__default['default'].isAbsolute(id);
// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs__default['default'].realpathSync(process.cwd());
const resolveApp = function (relativePath) {
    return path__default['default'].resolve(appDirectory, relativePath);
};
// Taken from Create React App, react-dev-utils/clearConsole
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/clearConsole.js
function clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}
function getReactVersion({ dependencies, devDependencies, }) {
    return ((dependencies && dependencies.react) ||
        (devDependencies && devDependencies.react));
}
function getNodeEngineRequirement({ engines }) {
    return engines && engines.node;
}

const paths = {
    appPackageJson: resolveApp('package.json'),
    tsconfigJson: resolveApp('tsconfig.json'),
    testsSetup: resolveApp('test/setupTests.ts'),
    appRoot: resolveApp('.'),
    appSrc: resolveApp('src'),
    appErrorsJson: resolveApp('errors/codes.json'),
    appErrors: resolveApp('errors'),
    appDist: resolveApp('dist'),
    appConfig: resolveApp('tsdx.config.js'),
    jestConfig: resolveApp('jest.config.js'),
    progressEstimatorCache: resolveApp('node_modules/.cache/.progress-estimator'),
};

let cmd$1;
async function getInstallCmd() {
    if (cmd$1) {
        return cmd$1;
    }
    try {
        await execa__default['default']('yarnpkg', ['--version']);
        cmd$1 = 'yarn';
    }
    catch (e) {
        cmd$1 = 'npm';
    }
    return cmd$1;
}

const cmd = (cmd) => {
    return chalk__default['default'].bold(chalk__default['default'].cyan(cmd));
};

const installing = function (packages) {
    const pkgText = packages
        .map(function (pkg) {
        return `    ${chalk__default['default'].cyan(chalk__default['default'].bold(pkg))}`;
    })
        .join('\n');
    return `Installing npm modules:
${pkgText}
`;
};
const start = async function (projectName) {
    const cmd$1 = await getInstallCmd();
    const commands = {
        install: cmd$1 === 'npm' ? 'npm install' : 'yarn install',
        build: cmd$1 === 'npm' ? 'npm run build' : 'yarn build',
        start: cmd$1 === 'npm' ? 'npm run start' : 'yarn start',
        test: cmd$1 === 'npm' ? 'npm test' : 'yarn test',
    };
    return `
  ${chalk__default['default'].green('Awesome!')} You're now ready to start coding.
  
  I already ran ${cmd(commands.install)} for you, so your next steps are:
    ${cmd(`cd ${projectName}`)}
  
  To start developing (rebuilds on changes):
    ${cmd(commands.start)}
  
  To build for production:
    ${cmd(commands.build)}

  To test your library with Jest:
    ${cmd(commands.test)}
    
  Questions? Feedback? Please let me know!
  ${chalk__default['default'].green('https://github.com/formium/tsdx/issues')}
`;
};
const incorrectNodeVersion = function (requiredVersion) {
    return `Unsupported Node version! Your current Node version (${chalk__default['default'].red(process.version)}) does not satisfy the requirement of Node ${chalk__default['default'].cyan(requiredVersion)}.`;
};

// largely borrowed from https://github.com/facebook/react/blob/8b2d3783e58d1acea53428a10d2035a8399060fe/scripts/error-codes/invertObject.js
function invertObject(targetObj) {
    const result = {};
    const mapKeys = Object.keys(targetObj);
    for (const originalKey of mapKeys) {
        const originalVal = targetObj[originalKey];
        result[originalVal] = originalKey;
    }
    return result;
}

// largely borrowed from https://github.com/facebook/react/blob/8b2d3783e58d1acea53428a10d2035a8399060fe/scripts/shared/evalToString.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function evalToString(ast) {
    switch (ast.type) {
        case 'StringLiteral':
        case 'Literal': // ESLint
            return ast.value;
        case 'BinaryExpression': // `+`
            if (ast.operator !== '+') {
                throw new Error('Unsupported binary operator ' + ast.operator);
            }
            return evalToString(ast.left) + evalToString(ast.right);
        default:
            throw new Error('Unsupported type ' + ast.type);
    }
}

// largely borrowed from https://github.com/facebook/react/blob/8b2d3783e58d1acea53428a10d2035a8399060fe/scripts/error-codes/extract-errors.js
const babelParserOptions = {
    sourceType: 'module',
    // As a parser, @babel/parser has its own options and we can't directly
    // import/require a babel preset. It should be kept **the same** as
    // the `babel-plugin-syntax-*` ones specified in
    // https://github.com/facebook/fbjs/blob/master/packages/babel-preset-fbjs/configure.js
    plugins: [
        'classProperties',
        'flow',
        'jsx',
        'trailingFunctionCommas',
        'objectRestSpread',
    ],
}; // workaround for trailingFunctionCommas syntax
async function extractErrors(opts) {
    if (!opts || !opts.errorMapFilePath) {
        throw new Error('Missing options. Ensure you pass an object with `errorMapFilePath`.');
    }
    if (!opts.name || !opts.name) {
        throw new Error('Missing options. Ensure you pass --name flag to tsdx');
    }
    const errorMapFilePath = opts.errorMapFilePath;
    let existingErrorMap;
    try {
        /**
         * Using `fs.readFile` instead of `require` here, because `require()` calls
         * are cached, and the cache map is not properly invalidated after file
         * changes.
         */
        const fileContents = await fs__default['default'].readFile(errorMapFilePath, 'utf-8');
        existingErrorMap = JSON.parse(fileContents);
    }
    catch (e) {
        existingErrorMap = {};
    }
    const allErrorIDs = Object.keys(existingErrorMap);
    let currentID;
    if (allErrorIDs.length === 0) {
        // Map is empty
        currentID = 0;
    }
    else {
        currentID = Math.max.apply(null, allErrorIDs) + 1;
    }
    // Here we invert the map object in memory for faster error code lookup
    existingErrorMap = invertObject(existingErrorMap);
    function transform(source) {
        const ast = parser.parse(source, babelParserOptions);
        traverse__default['default'](ast, {
            CallExpression: {
                exit(astPath) {
                    if (astPath.get('callee').isIdentifier({ name: 'invariant' })) {
                        const node = astPath.node;
                        // error messages can be concatenated (`+`) at runtime, so here's a
                        // trivial partial evaluator that interprets the literal value
                        const errorMsgLiteral = evalToString(node.arguments[1]);
                        addToErrorMap(errorMsgLiteral);
                    }
                },
            },
        });
    }
    function addToErrorMap(errorMsgLiteral) {
        if (existingErrorMap.hasOwnProperty(errorMsgLiteral)) {
            return;
        }
        existingErrorMap[errorMsgLiteral] = '' + currentID++;
    }
    async function flush() {
        const prettyName = pascalCase.pascalCase(safeVariableName(opts.name));
        // Ensure that the ./src/errors directory exists or create it
        await fs__default['default'].ensureDir(paths.appErrors);
        // Output messages to ./errors/codes.json
        await fs__default['default'].writeFile(errorMapFilePath, JSON.stringify(invertObject(existingErrorMap), null, 2) + '\n', 'utf-8');
        // Write the error files, unless they already exist
        await fs__default['default'].writeFile(paths.appErrors + '/ErrorDev.js', `
function ErrorDev(message) {
  const error = new Error(message);
  error.name = 'Invariant Violation';
  return error;
}

export default ErrorDev;
      `, 'utf-8');
        await fs__default['default'].writeFile(paths.appErrors + '/ErrorProd.js', `
function ErrorProd(code) {
  // TODO: replace this URL with yours
  let url = 'https://reactjs.org/docs/error-decoder.html?invariant=' + code;
  for (let i = 1; i < arguments.length; i++) {
    url += '&args[]=' + encodeURIComponent(arguments[i]);
  }
  return new Error(
    \`Minified ${prettyName} error #$\{code}; visit $\{url} for the full message or \` +
      'use the non-minified dev environment for full errors and additional ' +
      'helpful warnings. '
  );
}

export default ErrorProd;
`, 'utf-8');
    }
    return async function extractErrors(source) {
        transform(source);
        await flush();
    };
}

/**
 * @todo Do not use require.resolve so that the package can ship as ESM.
 */
const isTruthy = (obj) => {
    if (!obj) {
        return false;
    }
    return obj.constructor !== Object || Object.keys(obj).length > 0;
};
// replace lodash with lodash-es, but not lodash/fp
const replacements = [{ original: 'lodash(?!/fp)', replacement: 'lodash-es' }];
const mergeConfigItems = (type, ...configItemsToMerge) => {
    const mergedItems = [];
    configItemsToMerge.forEach(configItemToMerge => {
        configItemToMerge.forEach((item) => {
            const itemToMergeWithIndex = mergedItems.findIndex(mergedItem => mergedItem.file.resolved === item.file.resolved);
            if (itemToMergeWithIndex === -1) {
                mergedItems.push(item);
                return;
            }
            mergedItems[itemToMergeWithIndex] = core.createConfigItem([
                mergedItems[itemToMergeWithIndex].file.resolved,
                merge__default['default'](mergedItems[itemToMergeWithIndex].options, item.options),
            ], {
                type,
            });
        });
    });
    return mergedItems;
};
const createConfigItems = (type, items) => {
    return items.map(({ name, ...options }) => {
        return core.createConfigItem([require.resolve(name), options], { type });
    });
};
const babelPluginTsdx = pluginBabel.createBabelInputPluginFactory(() => ({
    // Passed the plugin options.
    options({ custom: customOptions, ...pluginOptions }) {
        return {
            // Pull out any custom options that the plugin might have.
            customOptions,
            // Pass the options back with the two custom options removed.
            pluginOptions,
        };
    },
    config(config, { customOptions }) {
        const defaultPlugins = createConfigItems('plugin', [
            // {
            //   name: '@babel/plugin-transform-react-jsx',
            //   pragma: customOptions.jsx || 'h',
            //   pragmaFrag: customOptions.jsxFragment || 'Fragment',
            // },
            { name: 'babel-plugin-macros' },
            { name: 'babel-plugin-annotate-pure-calls' },
            { name: 'babel-plugin-dev-expression' },
            customOptions.format !== 'cjs' && {
                name: 'babel-plugin-transform-rename-import',
                replacements,
            },
            {
                name: 'babel-plugin-polyfill-regenerator',
                // don't pollute global env as this is being used in a library
                method: 'usage-pure',
            },
            {
                name: '@babel/plugin-proposal-class-properties',
                loose: true,
            },
            isTruthy(customOptions.extractErrors) && {
                name: './errors/transformErrorMessages',
            },
        ].filter(Boolean));
        const babelOptions = config.options || {};
        babelOptions.presets = babelOptions.presets || [];
        const presetEnvIdx = babelOptions.presets.findIndex((preset) => preset.file.request.includes('@babel/preset-env'));
        // if they use preset-env, merge their options with ours
        if (presetEnvIdx !== -1) {
            const presetEnv = babelOptions.presets[presetEnvIdx];
            babelOptions.presets[presetEnvIdx] = core.createConfigItem([
                presetEnv.file.resolved,
                merge__default['default']({
                    loose: true,
                    targets: customOptions.targets,
                }, presetEnv.options, {
                    modules: false,
                }),
            ], {
                type: `preset`,
            });
        }
        else {
            // if no preset-env, add it & merge with their presets
            const defaultPresets = createConfigItems('preset', [
                {
                    name: '@babel/preset-env',
                    targets: customOptions.targets,
                    modules: false,
                    loose: true,
                },
            ]);
            babelOptions.presets = mergeConfigItems('preset', defaultPresets, babelOptions.presets);
        }
        // Merge babelrc & our plugins together
        babelOptions.plugins = mergeConfigItems('plugin', defaultPlugins, babelOptions.plugins || []);
        return babelOptions;
    },
}));

/**
 * These packages will not be resolved by Rollup and will be left as imports.
 */
const EXTERNAL_PACKAGES = ['react', 'react-native'];
const errorCodeOpts = {
    errorMapFilePath: paths.appErrorsJson,
};
// shebang cache map thing because the transform only gets run once
let shebang = {};
async function createRollupConfig(opts, outputNum) {
    const findAndRecordErrorCodes = await extractErrors({
        ...errorCodeOpts,
        ...opts,
    });
    const isEsm = opts.format.includes('es') || opts.format.includes('esm');
    const shouldMinify = opts.minify !== undefined
        ? opts.minify
        : opts.env === 'production' || isEsm;
    let formatString = ['esm', 'cjs'].includes(opts.format) ? '' : opts.format;
    let fileExtension = opts.format === 'esm' ? 'mjs' : 'cjs';
    const outputName = [
        `${paths.appDist}/${safePackageName(opts.name)}`,
        formatString,
        opts.env,
        shouldMinify ? 'min' : '',
        fileExtension,
    ]
        .filter(Boolean)
        .join('.');
    const tsconfigPath = opts.tsconfig || paths.tsconfigJson;
    // borrowed from https://github.com/facebook/create-react-app/pull/7248
    const tsconfigJSON = ts__default['default'].readConfigFile(tsconfigPath, ts__default['default'].sys.readFile).config;
    // borrowed from https://github.com/ezolenko/rollup-plugin-typescript2/blob/42173460541b0c444326bf14f2c8c27269c4cb11/src/parse-tsconfig.ts#L48
    const tsCompilerOptions = ts__default['default'].parseJsonConfigFileContent(tsconfigJSON, ts__default['default'].sys, './').options;
    const { PRODUCTION } = process.env;
    return {
        // Tell Rollup the entry point to the package
        input: opts.input,
        // Tell Rollup which packages to ignore
        external: (id) => {
            // bundle in polyfills as TSDX can't (yet) ensure they're installed as deps
            if (id.startsWith('regenerator-runtime')) {
                return false;
            }
            if (EXTERNAL_PACKAGES.includes(id)) {
                return true;
            }
            return external(id);
        },
        // Minimize runtime error surface as much as possible
        shimMissingExports: true,
        // Rollup has treeshaking by default, but we can optimize it further...
        treeshake: {
            // We assume reading a property of an object never has side-effects.
            // This means tsdx WILL remove getters and setters defined directly on objects.
            // Any getters or setters defined on classes will not be effected.
            //
            // @example
            //
            // const foo = {
            //  get bar() {
            //    console.log('effect');
            //    return 'bar';
            //  }
            // }
            //
            // const result = foo.bar;
            // const illegalAccess = foo.quux.tooDeep;
            //
            // Punchline....Don't use getters and setters
            propertyReadSideEffects: false,
        },
        // Establish Rollup output
        output: {
            // Set filenames of the consumer's package
            file: outputName,
            // Pass through the file format
            format: isEsm ? 'es' : opts.format,
            // Do not let Rollup call Object.freeze() on namespace import objects
            // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
            freeze: false,
            // Respect tsconfig esModuleInterop when setting __esModule.
            esModule: Boolean(tsCompilerOptions?.esModuleInterop) || isEsm,
            name: opts.name || safeVariableName(opts.name),
            sourcemap: true,
            globals: {
                react: 'React',
                'react-native': 'ReactNative',
                'lodash-es': 'lodashEs',
                'lodash/fp': 'lodashFp',
            },
            exports: 'named',
        },
        plugins: [
            /**
             * Extract errors to `errors/` dir if --extractErrors passed.
             */
            opts.extractErrors && {
                name: 'Extract errors',
                async transform(code) {
                    try {
                        await findAndRecordErrorCodes(code);
                    }
                    catch (e) {
                        return null;
                    }
                    return { code, map: null };
                },
            },
            /**
             * Resolve only non-JS. Leave regular imports alone, since packages will
             * ship with dependencies.
             */
            resolve__default['default']({
                /**
                 * Do not allow CJS imports.
                 */
                modulesOnly: true,
                /**
                 * For node output, do not resolve `browser` field.
                 */
                browser: opts.target !== 'node',
                /**
                 * Resolve JSX, JSON, and .node files.
                 */
                extensions: ['.jsx', '.json', '.node'],
            }),
            /**
             * All bundled external modules need to be converted from CJS to ESM.
             */
            commonjs__default['default']({
                /**
                 * CJS/ESM interop. Support Node's .cjs and .mjs spec.
                 */
                extensions: ['.js', '.cjs', '.mjs'],
                /**
                 * Allow require('my-package') === await import('my-package').
                 *
                 * The `modulesOnly` option of @rollup/plugin-node-resolve ensures that
                 * the compiler will throw if there is an issue
                 */
                esmExternals: true,
                requireReturnsDefault: true,
                /**
                 * Turn `require` statements into `import` statements in ESM out.
                 */
                transformMixedEsModules: true,
                /**
                 * Use Regex to make sure to include eventual hoisted packages.
                 */
                include: opts.format === 'umd' || isEsm
                    ? /\/node_modules\//
                    : /\/regenerator-runtime\//,
            }),
            /**
             * Convert JSON to ESM.
             */
            json__default['default'](),
            /**
             * Custom plugin that removes shebang from code because newer versions of
             * bublé bundle their own private version of `acorn` and we can't find a
             * way to patch in the option `allowHashBang` to acorn. Taken from
             * microbundle.
             *
             * @see https://github.com/Rich-Harris/buble/pull/165
             */
            {
                name: 'Remove shebang',
                transform(code) {
                    let reg = /^#!(.*)/;
                    let match = code.match(reg);
                    shebang[opts.name] = match ? '#!' + match[1] : '';
                    code = code.replace(reg, '');
                    return {
                        code,
                        map: null,
                    };
                },
            },
            /**
             * Run TSC and transpile TypeScript.
             */
            typescript__default['default']({
                typescript: ts__default['default'],
                tsconfig: opts.tsconfig,
                tsconfigDefaults: {
                    exclude: [
                        // all TS test files, regardless whether co-located or in test/ etc
                        '**/*.spec.ts',
                        '**/*.test.ts',
                        '**/*.spec.tsx',
                        '**/*.test.tsx',
                        // TS defaults below
                        'node_modules',
                        'bower_components',
                        'jspm_packages',
                        paths.appDist,
                    ],
                    compilerOptions: {
                        sourceMap: true,
                        declaration: true,
                        jsx: 'react',
                    },
                },
                tsconfigOverride: {
                    compilerOptions: {
                        // TS -> esnext, then leave the rest to babel-preset-env
                        module: 'esnext',
                        target: 'esnext',
                        // don't output declarations more than once
                        ...(outputNum > 0
                            ? { declaration: false, declarationMap: false }
                            : {}),
                    },
                },
                check: !opts.transpileOnly && outputNum === 0,
                useTsconfigDeclarationDir: Boolean(tsCompilerOptions?.declarationDir),
            }),
            /**
             * In --legacy mode, use Babel to transpile to ES5.
             */
            opts.legacy &&
                babelPluginTsdx({
                    exclude: 'node_modules/**',
                    extensions: [...core.DEFAULT_EXTENSIONS, 'ts', 'tsx'],
                    passPerPreset: true,
                    custom: {
                        targets: {
                            ...(opts.target === 'node' ? { node: 14 } : {}),
                            esmodules: isEsm,
                        },
                        extractErrors: opts.extractErrors,
                        format: opts.format,
                    },
                    babelHelpers: 'bundled',
                }),
            sourceMaps__default['default'](),
            /**
             * Minify and compress with Terser for max DCE. Emit latest featureset.
             *
             * This is called before @rollup/replace-plugin to minimize the emitted
             * code it would need to search.
             */
            shouldMinify &&
                rollupPluginTerser.terser({
                    format: {
                        keep_quoted_props: true,
                        comments: false,
                    },
                    compress: {
                        keep_infinity: true,
                        pure_getters: true,
                        passes: 10,
                    },
                    ecma: opts.legacy ? 5 : 2020,
                    module: isEsm,
                    toplevel: opts.format === 'cjs' || isEsm,
                }),
            rollupPlugin.optimizeLodashImports({
                useLodashEs: isEsm || undefined,
            }),
            /**
             * Replace process.env.NODE_ENV variable.
             */
            opts.env &&
                replace__default['default']({
                    preventAssignment: true,
                    'process.env.NODE_ENV': JSON.stringify(PRODUCTION ? 'production' : 'development'),
                }),
            /**
             * If not in --legacy mode, ensure lodash imports are optimized in the
             * final bundle.
             */
            !opts.legacy &&
                rollupPlugin.optimizeLodashImports({
                    useLodashEs: isEsm || undefined,
                }),
            /**
             * Ensure there's an empty default export. This is the only way to have a
             * dist/index.mjs with `export { default } from './package.min.mjs'` and
             * support default exports at all.
             *
             * @see https://www.npmjs.com/package/rollup-plugin-export-default
             */
            {
                name: 'Ensure default exports',
                renderChunk: async (code, chunk) => {
                    if (chunk.exports.includes('default') || !isEsm) {
                        return null;
                    }
                    return {
                        code: `${code}\nexport default {};`,
                        map: null,
                    };
                },
            },
        ],
    };
}

// check for custom tsdx.config.js
let tsdxConfig = {
    rollup(config, _options) {
        return config;
    },
};
if (fs$1.existsSync(paths.appConfig)) {
    tsdxConfig = require(paths.appConfig);
}
async function createBuildConfigs(opts) {
    const allInputs = jpjs.concatAllArray(opts.input.map((input) => createAllFormats(opts, input).map((options, index) => ({
        ...options,
        // We want to know if this is the first run for each entryfile
        // for certain plugins (e.g. css)
        writeMeta: index === 0,
    }))));
    return await Promise.all(allInputs.map(async (options, index) => {
        // pass the full rollup config to tsdx.config.js override
        const config = await createRollupConfig(options, index);
        return tsdxConfig.rollup(config, options);
    }));
}
function createAllFormats(opts, input) {
    return [
        opts.format.includes('cjs') && {
            ...opts,
            format: 'cjs',
            env: 'development',
            input,
        },
        opts.format.includes('cjs') && {
            ...opts,
            format: 'cjs',
            env: 'production',
            input,
        },
        opts.format.includes('esm') && { ...opts, format: 'esm', input },
        opts.format.includes('umd') && {
            ...opts,
            format: 'umd',
            env: 'development',
            input,
        },
        opts.format.includes('umd') && {
            ...opts,
            format: 'umd',
            env: 'production',
            input,
        },
        opts.format.includes('system') && {
            ...opts,
            format: 'system',
            env: 'development',
            input,
        },
        opts.format.includes('system') && {
            ...opts,
            format: 'system',
            env: 'production',
            input,
        },
    ].filter(Boolean);
}

function createJestConfig(_, rootDir) {
    const config = {
        transform: {
            '.(ts|tsx)$': require.resolve('ts-jest/dist'),
            '.(js|jsx)$': require.resolve('babel-jest'), // jest's default
        },
        transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
        collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
        testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
        testURL: 'http://localhost',
        rootDir,
        watchPlugins: [
            require.resolve('jest-watch-typeahead/filename'),
            require.resolve('jest-watch-typeahead/testname'),
        ],
    };
    return config;
}

async function createEslintConfig({ pkg, rootDir, writeFile, }) {
    const isReactLibrary = Boolean(getReactVersion(pkg));
    const config = {
        extends: [
            'react-app',
            'prettier/@typescript-eslint',
            'plugin:prettier/recommended',
        ],
        settings: {
            react: {
                // Fix for https://github.com/jaredpalmer/tsdx/issues/279
                version: isReactLibrary ? 'detect' : '999.999.999',
            },
        },
    };
    if (!writeFile) {
        return config;
    }
    const file = path__default['default'].join(rootDir, '.eslintrc.js');
    try {
        await fs__default['default'].writeFile(file, `module.exports = ${JSON.stringify(config, null, 2)}`, { flag: 'wx' });
    }
    catch (e) {
        if (e.code === 'EEXIST') {
            console.error('Error trying to save the Eslint configuration file:', `${file} already exists.`);
        }
        else {
            console.error(e);
        }
        return config;
    }
}

function getInstallArgs(cmd, packages) {
    switch (cmd) {
        case 'npm':
            return ['install', ...packages, '--save-dev'];
        case 'yarn':
            return ['add', ...packages, '--dev'];
    }
}

async function createProgressEstimator() {
    await fs__default['default'].ensureDir(paths.progressEstimatorCache);
    return progressEstimator__default['default']({
        // All configuration keys are optional, but it's recommended to specify a storage location.
        storagePath: paths.progressEstimatorCache,
    });
}

const basicTemplate = {
    name: 'basic',
    dependencies: [
        'husky',
        'tsdx',
        'tslib',
        'typescript',
        'size-limit',
        '@size-limit/preset-small-lib',
    ],
    packageJson: {
        // name: safeName,
        version: '0.1.0',
        license: 'MIT',
        // author: author,
        main: './dist/index.cjs',
        module: './dist/index.mjs',
        exports: {
            './package.json': './package.json',
            '.': {
                import: './dist/index.mjs',
                require: './dist/index.cjs',
            },
        },
        // module: `dist/${safeName}.mjs`,
        typings: `dist/index.d.ts`,
        files: ['dist', 'src'],
        engines: {
            node: '>=14',
        },
        scripts: {
            start: 'tsdx watch',
            build: 'tsdx build',
            test: 'tsdx test',
            posttest: 'node test/import.mjs && node test/require.cjs',
            lint: 'tsdx lint',
            prepare: 'tsdx build',
            size: 'size-limit',
            analyze: 'size-limit --why',
        },
        peerDependencies: {},
        husky: {
            hooks: {
                'pre-commit': 'tsdx lint',
            },
        },
        prettier: {
            printWidth: 80,
            semi: true,
            singleQuote: true,
            trailingComma: 'es5',
        },
    },
};

const reactTemplate = {
    name: 'react',
    dependencies: [
        ...basicTemplate.dependencies,
        '@types/react',
        '@types/react-dom',
        'react',
        'react-dom',
    ],
    packageJson: {
        ...basicTemplate.packageJson,
        peerDependencies: {
            react: '>=16',
        },
        scripts: {
            ...basicTemplate.packageJson.scripts,
            test: 'tsdx test',
        },
    },
};

const storybookTemplate = {
    dependencies: [
        ...reactTemplate.dependencies,
        '@babel/core',
        '@storybook/addon-essentials',
        '@storybook/addon-links',
        '@storybook/addon-info',
        '@storybook/addons',
        '@storybook/react',
        'react-is',
        'babel-loader',
    ],
    name: 'react-with-storybook',
    packageJson: {
        ...reactTemplate.packageJson,
        scripts: {
            ...reactTemplate.packageJson.scripts,
            storybook: 'start-storybook -p 6006',
            'build-storybook': 'build-storybook',
        },
    },
};

const templates = {
    basic: basicTemplate,
    react: reactTemplate,
    'react-with-storybook': storybookTemplate,
};

const composePackageJson = (template) => ({ name, author, }) => {
    return {
        ...template.packageJson,
        name,
        author,
        'size-limit': [
            {
                path: `dist/${name}.production.min.cjs`,
                limit: '10 KB',
            },
            {
                path: `dist/${name}.min.mjs`,
                limit: '10 KB',
            },
        ],
    };
};

/*
  This was originally needed because the default
  tsconfig.compilerOptions.rootDir was set to './' instead of './src'.
  Now that it's set to './src', this is now deprecated.
  To ensure a stable upgrade path for users, leave the warning in for
  6 months - 1 year, then change it to an error in a breaking bump and leave
  that in for some time too.
*/
async function moveTypes() {
    const appDistSrc = paths.appDist + '/src';
    const pathExists = await fs__namespace.pathExists(appDistSrc);
    if (!pathExists)
        return;
    // see note above about deprecation window
    console.warn('[tsdx]: Your rootDir is currently set to "./". Please change your ' +
        'rootDir to "./src".\n' +
        'TSDX has deprecated setting tsconfig.compilerOptions.rootDir to ' +
        '"./" as it caused buggy output for declarationMaps and more.\n' +
        'You may also need to change your include to remove "test", which also ' +
        'caused declarations to be unnecessarily created for test files.');
    // Move the type declarations to the base of the ./dist folder
    await fs__namespace.copy(appDistSrc, paths.appDist, {
        overwrite: true,
    });
    await fs__namespace.remove(appDistSrc);
}

const prog = sade__default['default']('tsdx');
let appPackageJson;
try {
    appPackageJson = JSON.parse(fs$1.readFileSync(paths.appPackageJson, 'utf-8'));
}
catch (e) { }
const isDir = (name) => promises.stat(name)
    .then((stats) => stats.isDirectory())
    .catch(() => false);
const isFile = (name) => promises.stat(name)
    .then((stats) => stats.isFile())
    .catch(() => false);
async function jsOrTs(filename) {
    const extension = (await isFile(resolveApp(filename + '.ts')))
        ? '.ts'
        : (await isFile(resolveApp(filename + '.tsx')))
            ? '.tsx'
            : (await isFile(resolveApp(filename + '.jsx')))
                ? '.jsx'
                : '.js';
    return resolveApp(`${filename}${extension}`);
}
async function getInputs(entries, source) {
    return jpjs.concatAllArray([]
        .concat(entries && entries.length
        ? entries
        : (source && resolveApp(source)) ||
            ((await isDir(resolveApp('src'))) && (await jsOrTs('src/index'))))
        .map((file) => glob__default['default'](file)));
}
prog
    .command('create <pkg>')
    .describe('Create a new package with TSDX')
    .example('create mypackage')
    .option('--template', `Specify a template. Allowed choices: [${Object.keys(templates).join(', ')}]`)
    .example('create --template react mypackage')
    .action(async (pkg, opts) => {
    console.log(chalk__default['default'].blue(`
::::::::::: ::::::::  :::::::::  :::    :::
    :+:    :+:    :+: :+:    :+: :+:    :+:
    +:+    +:+        +:+    +:+  +:+  +:+
    +#+    +#++:++#++ +#+    +:+   +#++:+
    +#+           +#+ +#+    +#+  +#+  +#+
    #+#    #+#    #+# #+#    #+# #+#    #+#
    ###     ########  #########  ###    ###
`));
    const bootSpinner = ora__default['default'](`Creating ${chalk__default['default'].bold.green(pkg)}...`);
    let template;
    // Helper fn to prompt the user for a different
    // folder name if one already exists
    async function getProjectPath(projectPath) {
        const exists = await fs__namespace.pathExists(projectPath);
        if (!exists) {
            return projectPath;
        }
        bootSpinner.fail(`Failed to create ${chalk__default['default'].bold.red(pkg)}`);
        const prompt = new Input__default['default']({
            message: `A folder named ${chalk__default['default'].bold.red(pkg)} already exists! ${chalk__default['default'].bold('Choose a different name')}`,
            initial: pkg + '-1',
            result: (v) => v.trim(),
        });
        pkg = await prompt.run();
        projectPath = (await fs__namespace.realpath(process.cwd())) + '/' + pkg;
        bootSpinner.start(`Creating ${chalk__default['default'].bold.green(pkg)}...`);
        return await getProjectPath(projectPath); // recursion!
    }
    try {
        // get the project path
        const realPath = await fs__namespace.realpath(process.cwd());
        let projectPath = await getProjectPath(realPath + '/' + pkg);
        const prompt = new Select__default['default']({
            message: 'Choose a template',
            choices: Object.keys(templates),
        });
        if (opts.template) {
            template = opts.template.trim();
            if (!prompt.choices.includes(template)) {
                bootSpinner.fail(`Invalid template ${chalk__default['default'].bold.red(template)}`);
                template = await prompt.run();
            }
        }
        else {
            template = await prompt.run();
        }
        bootSpinner.start();
        // copy the template
        await fs__namespace.copy(path__default['default'].resolve(__dirname, `../templates/${template}`), projectPath, {
            overwrite: true,
        });
        // fix gitignore
        await fs__namespace.move(path__default['default'].resolve(projectPath, './gitignore'), path__default['default'].resolve(projectPath, './.gitignore'));
        // update license year and author
        let license = await fs__namespace.readFile(path__default['default'].resolve(projectPath, 'LICENSE'), { encoding: 'utf-8' });
        license = license.replace(/<year>/, `${new Date().getFullYear()}`);
        // attempt to automatically derive author name
        let author = getAuthorName();
        if (!author) {
            bootSpinner.stop();
            const licenseInput = new Input__default['default']({
                name: 'author',
                message: 'Who is the package author?',
            });
            author = await licenseInput.run();
            setAuthorName(author);
            bootSpinner.start();
        }
        license = license.replace(/<author>/, author.trim());
        await fs__namespace.writeFile(path__default['default'].resolve(projectPath, 'LICENSE'), license, {
            encoding: 'utf-8',
        });
        const templateConfig = templates[template];
        const generatePackageJson = composePackageJson(templateConfig);
        // Install deps
        process.chdir(projectPath);
        const safeName = safePackageName(pkg);
        const pkgJson = generatePackageJson({ name: safeName, author });
        const nodeVersionReq = getNodeEngineRequirement(pkgJson);
        if (nodeVersionReq &&
            !semver__default['default'].satisfies(process.version, nodeVersionReq)) {
            bootSpinner.fail(incorrectNodeVersion(nodeVersionReq));
            process.exit(1);
        }
        await fs__namespace.outputJSON(path__default['default'].resolve(projectPath, 'package.json'), pkgJson);
        bootSpinner.succeed(`Created ${chalk__default['default'].bold.green(pkg)}`);
        await start(pkg);
    }
    catch (error) {
        bootSpinner.fail(`Failed to create ${chalk__default['default'].bold.red(pkg)}`);
        logError(error);
        process.exit(1);
    }
    const templateConfig = templates[template];
    const { dependencies: deps } = templateConfig;
    const installSpinner = ora__default['default'](installing(deps.sort())).start();
    try {
        const cmd = await getInstallCmd();
        await execa__default['default'](cmd, getInstallArgs(cmd, deps));
        installSpinner.succeed('Installed dependencies');
        console.log(await start(pkg));
    }
    catch (error) {
        installSpinner.fail('Failed to install dependencies');
        logError(error);
        process.exit(1);
    }
});
prog
    .command('watch')
    .describe('Rebuilds on any change')
    .option('--entry, -i', 'Entry module')
    .example('watch --entry src/foo.tsx')
    .option('--target', 'Specify your target environment', 'browser')
    .example('watch --target node')
    .option('--name', 'Specify name exposed in UMD builds')
    .example('watch --name Foo')
    .option('--format', 'Specify module format(s)', 'cjs,esm')
    .example('watch --format cjs,esm')
    .option('--verbose', 'Keep outdated console output in watch mode instead of clearing the screen')
    .example('watch --verbose')
    .option('--noClean', "Don't clean the dist folder")
    .example('watch --noClean')
    .option('--tsconfig', 'Specify custom tsconfig path')
    .example('watch --tsconfig ./tsconfig.foo.json')
    .option('--onFirstSuccess', 'Run a command on the first successful build')
    .example('watch --onFirstSuccess "echo The first successful build!"')
    .option('--onSuccess', 'Run a command on a successful build')
    .example('watch --onSuccess "echo Successful build!"')
    .option('--onFailure', 'Run a command on a failed build')
    .example('watch --onFailure "The build failed!"')
    .option('--transpileOnly', 'Skip type checking')
    .example('watch --transpileOnly')
    .option('--extractErrors', 'Extract invariant errors to ./errors/codes.json.')
    .example('watch --extractErrors')
    .action(async (dirtyOpts) => {
    const opts = await normalizeOpts(dirtyOpts);
    const buildConfigs = await createBuildConfigs(opts);
    if (!opts.noClean) {
        await cleanDistFolder();
    }
    if (opts.format.includes('cjs')) {
        await writeCjsEntryFile(opts.name);
    }
    if (opts.format.includes('esm')) {
        await writeMjsEntryFile(opts.name);
    }
    let firstTime = true;
    let successKiller = null;
    let failureKiller = null;
    function run(command) {
        if (!command) {
            return null;
        }
        const [exec, ...args] = command.split(' ');
        return execa__default['default'](exec, args, {
            stdio: 'inherit',
        });
    }
    function killHooks() {
        return Promise.all([
            successKiller ? successKiller.kill('SIGTERM') : null,
            failureKiller ? failureKiller.kill('SIGTERM') : null,
        ]);
    }
    const spinner = ora__default['default']().start();
    rollup.watch(buildConfigs.map((inputOptions) => ({
        watch: {
            silent: true,
            include: ['src/**'],
            exclude: ['node_modules/**'],
        },
        ...inputOptions,
    }))).on('event', async (event) => {
        // clear previous onSuccess/onFailure hook processes so they don't pile up
        await killHooks();
        if (event.code === 'START') {
            if (!opts.verbose) {
                clearConsole();
            }
            spinner.start(chalk__default['default'].bold.cyan('Compiling modules...'));
        }
        if (event.code === 'ERROR') {
            spinner.fail(chalk__default['default'].bold.red('Failed to compile'));
            logError(event.error);
            failureKiller = run(opts.onFailure);
        }
        if (event.code === 'END') {
            spinner.succeed(chalk__default['default'].bold.green('Compiled successfully'));
            console.log(`
  ${chalk__default['default'].dim('Watching for changes')}
`);
            try {
                await moveTypes();
                if (firstTime && opts.onFirstSuccess) {
                    firstTime = false;
                    run(opts.onFirstSuccess);
                }
                else {
                    successKiller = run(opts.onSuccess);
                }
            }
            catch (_error) { }
        }
    });
});
prog
    .command('build')
    .describe('Build your project once and exit')
    .option('--entry, -i', 'Entry module')
    .example('build --entry src/foo.tsx')
    .option('--target', 'Specify your target environment', 'browser')
    .example('build --target node')
    .option('--name', 'Specify name exposed in UMD builds')
    .example('build --name Foo')
    .option('--format', 'Specify module format(s)', 'cjs,esm')
    .example('build --format cjs,esm')
    .option('--legacy', 'Babel transpile and emit ES5.')
    .example('build --legacy')
    .option('--tsconfig', 'Specify custom tsconfig path')
    .example('build --tsconfig ./tsconfig.foo.json')
    .option('--transpileOnly', 'Skip type checking')
    .example('build --transpileOnly')
    .option('--extractErrors', 'Extract errors to ./errors/codes.json and provide a url for decoding.')
    .example('build --extractErrors=https://reactjs.org/docs/error-decoder.html?invariant=')
    .action(async (dirtyOpts) => {
    const opts = await normalizeOpts(dirtyOpts);
    const buildConfigs = await createBuildConfigs(opts);
    await cleanDistFolder();
    const logger = await createProgressEstimator();
    if (opts.format.includes('cjs')) {
        const promise = writeCjsEntryFile(opts.name).catch(logError);
        logger(promise, 'Creating CJS entry file');
    }
    if (opts.format.includes('esm')) {
        const promise = writeMjsEntryFile(opts.name).catch(logError);
        logger(promise, 'Creating MJS entry file');
    }
    try {
        const promise = asyncro__default['default']
            .map(buildConfigs, async (inputOptions) => {
            let bundle = await rollup.rollup(inputOptions);
            await bundle.write(inputOptions.output);
        })
            .catch((e) => {
            throw e;
        })
            .then(async () => {
            await moveTypes();
        });
        logger(promise, 'Building modules');
        await promise;
    }
    catch (error) {
        logError(error);
        process.exit(1);
    }
});
async function normalizeOpts(opts) {
    return {
        ...opts,
        name: opts.name || appPackageJson.name,
        input: await getInputs(opts.entry, appPackageJson.source),
        format: opts.format.split(',').map((format) => {
            if (format === 'es') {
                return 'esm';
            }
            return format;
        }),
    };
}
async function cleanDistFolder() {
    await fs__namespace.remove(paths.appDist);
}
function writeCjsEntryFile(name) {
    const safeName = safePackageName(name);
    /**
     * After an hour of tinkering, this is the *only* way to write this code that
     * will not break Rollup (by pulling process.env.NODE_ENV out with
     * destructuring).
     */
    const contents = `#!/usr/bin/env node
'use strict';

const { NODE_ENV } = process.env;
if (NODE_ENV === 'production')
  module.exports = require('./${safeName}.production.min.cjs');
else
  module.exports = require('./${safeName}.development.cjs');
`;
    /**
     * @todo Find out why this breaks Rollup's parser in insanely complicated
     * ways.
     */
    //   const contents = `'use strict'
    // if (process.env.NODE_ENV === 'production') {
    //   module.exports = require('./${safeName}.production.min.cjs')
    // } else {
    //   module.exports = require('./${safeName}.development.cjs')
    // }`;
    return fs__namespace.outputFile(path__default['default'].join(paths.appDist, 'index.cjs'), contents);
}
function writeMjsEntryFile(name) {
    const contents = `#!/usr/bin/env node

export { default } from './${name}.min.mjs';
export * from './${name}.min.mjs';
`;
    return fs__namespace.outputFile(path__default['default'].join(paths.appDist, 'index.mjs'), contents);
}
function getAuthorName() {
    let author = '';
    author = shell__default['default']
        .exec('npm config get init-author-name', { silent: true })
        .stdout.trim();
    if (author)
        return author;
    author = shell__default['default']
        .exec('git config --global user.name', { silent: true })
        .stdout.trim();
    if (author) {
        setAuthorName(author);
        return author;
    }
    author = shell__default['default']
        .exec('npm config get init-author-email', { silent: true })
        .stdout.trim();
    if (author)
        return author;
    author = shell__default['default']
        .exec('git config --global user.email', { silent: true })
        .stdout.trim();
    if (author)
        return author;
    return author;
}
function setAuthorName(author) {
    shell__default['default'].exec(`npm config set init-author-name "${author}"`, { silent: true });
}
prog
    .command('test')
    .describe('Run jest test runner. Passes through all flags directly to Jest')
    .action(async (opts) => {
    // Do this as the first thing so that any code reading it knows the right env.
    process.env.BABEL_ENV = 'test';
    process.env.NODE_ENV = 'test';
    // Makes the script crash on unhandled rejections instead of silently
    // ignoring them. In the future, promise rejections that are not handled will
    // terminate the Node.js process with a non-zero exit code.
    process.on('unhandledRejection', (err) => {
        throw err;
    });
    const argv = process.argv.slice(2);
    let jestConfig = {
        ...createJestConfig((relativePath) => path__default['default'].resolve(__dirname, '..', relativePath), opts.config ? path__default['default'].dirname(opts.config) : paths.appRoot),
        ...appPackageJson.jest,
    };
    // Allow overriding with jest.config
    const defaultPathExists = await fs__namespace.pathExists(paths.jestConfig);
    if (opts.config || defaultPathExists) {
        const jestConfigPath = resolveApp(opts.config || paths.jestConfig);
        const jestConfigContents = require(jestConfigPath);
        jestConfig = { ...jestConfig, ...jestConfigContents };
    }
    // if custom path, delete the arg as it's already been merged
    if (opts.config) {
        let configIndex = argv.indexOf('--config');
        if (configIndex !== -1) {
            // case of "--config path", delete both args
            argv.splice(configIndex, 2);
        }
        else {
            // case of "--config=path", only one arg to delete
            const configRegex = /--config=.+/;
            configIndex = argv.findIndex((arg) => arg.match(configRegex));
            if (configIndex !== -1) {
                argv.splice(configIndex, 1);
            }
        }
    }
    argv.push('--config', JSON.stringify({
        ...jestConfig,
    }));
    const [, ...argsToPassToJestCli] = argv;
    jest__default['default'].run(argsToPassToJestCli);
});
prog
    .command('lint')
    .describe('Run eslint with Prettier')
    .example('lint src test')
    .option('--fix', 'Fixes fixable errors and warnings')
    .example('lint src test --fix')
    .option('--ignore-pattern', 'Ignore a pattern')
    .example('lint src test --ignore-pattern test/foobar.ts')
    .option('--max-warnings', 'Exits with non-zero error code if number of warnings exceed this number', Infinity)
    .example('lint src test --max-warnings 10')
    .option('--write-file', 'Write the config file locally')
    .example('lint --write-file')
    .option('--report-file', 'Write JSON report to file locally')
    .example('lint --report-file eslint-report.json')
    .action(async (opts) => {
    if (opts['_'].length === 0 && !opts['write-file']) {
        const defaultInputs = ['src', 'test'].filter(fs__namespace.existsSync);
        opts['_'] = defaultInputs;
        console.log(chalk__default['default'].yellow(`Defaulting to "tsdx lint ${defaultInputs.join(' ')}"`, '\nYou can override this in the package.json scripts, like "lint": "tsdx lint src otherDir"'));
    }
    const config = await createEslintConfig({
        pkg: appPackageJson,
        rootDir: paths.appRoot,
        writeFile: opts['write-file'],
    });
    const cli = new eslint.CLIEngine({
        baseConfig: {
            ...config,
            ...appPackageJson.eslint,
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fix: opts.fix,
        ignorePattern: opts['ignore-pattern'],
    });
    const report = cli.executeOnFiles(opts['_']);
    if (opts.fix) {
        eslint.CLIEngine.outputFixes(report);
    }
    console.log(cli.getFormatter()(report.results));
    if (opts['report-file']) {
        await fs__namespace.outputFile(opts['report-file'], cli.getFormatter('json')(report.results));
    }
    if (report.errorCount) {
        process.exit(1);
    }
    if (report.warningCount > opts['max-warnings']) {
        process.exit(1);
    }
});
prog.parse(process.argv);

exports.isDir = isDir;
exports.isFile = isFile;
//# sourceMappingURL=tsdx.development.cjs.map
