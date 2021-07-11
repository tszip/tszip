"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRollupConfig = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const rollup_plugin_terser_1 = require("rollup-plugin-terser");
const core_1 = require("@babel/core");
const plugin_commonjs_1 = tslib_1.__importDefault(require("@rollup/plugin-commonjs"));
const plugin_json_1 = tslib_1.__importDefault(require("@rollup/plugin-json"));
const plugin_node_resolve_1 = tslib_1.__importDefault(require("@rollup/plugin-node-resolve"));
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const estree_walker_1 = tslib_1.__importDefault(require("estree-walker"));
const extractErrors_1 = require("./errors/extractErrors");
const babelPluginTsdx_1 = require("./babelPluginTsdx");
const rollup_plugin_1 = require("@optimize-lodash/rollup-plugin");
const remove_shebang_1 = require("./plugins/remove-shebang");
const path_1 = require("path");
const errorCodeOpts = {
    errorMapFilePath: constants_1.paths.appErrorsJson,
};
async function createRollupConfig(opts
// entryPoint?: string
) {
    const findAndRecordErrorCodes = await extractErrors_1.extractErrors({
        ...errorCodeOpts,
        ...opts,
    });
    const isEsm = opts.format.includes('es') || opts.format.includes('esm');
    const shouldMinify = opts.minify !== undefined
        ? opts.minify
        : opts.env === 'production' || isEsm;
    const tsconfigPath = opts.tsconfig || constants_1.paths.tsconfigJson;
    // borrowed from https://github.com/facebook/create-react-app/pull/7248
    const tsconfigJSON = typescript_1.default.readConfigFile(tsconfigPath, typescript_1.default.sys.readFile).config;
    // borrowed from https://github.com/ezolenko/rollup-plugin-typescript2/blob/42173460541b0c444326bf14f2c8c27269c4cb11/src/parse-tsconfig.ts#L48
    const tsCompilerOptions = typescript_1.default.parseJsonConfigFileContent(tsconfigJSON, typescript_1.default.sys, './').options;
    return {
        // Tell Rollup the entry point to the package
        input: opts.input,
        // Tell Rollup which packages to ignore
        external: (id) => {
            const resolvedId = path_1.resolve(id);
            const resolvedEntry = path_1.resolve(opts.input);
            /**
             * Do not mark the entry point as external.
             */
            if (resolvedId === resolvedEntry) {
                return false;
            }
            /**
             * Bundle in polyfills as TSDX can't (yet) ensure they're installed as
             * deps.
             */
            if (id.startsWith('regenerator-runtime')) {
                return false;
            }
            /**
             * Otherwise, mark external.
             */
            return true;
        },
        // Minimize runtime error surface as much as possible
        shimMissingExports: true,
        // Customize tree-shaking options
        treeshake: {
            propertyReadSideEffects: false,
        },
        // Establish Rollup output
        output: {
            // Set filenames of the consumer's package
            file: opts.input,
            // Pass through the file format
            format: isEsm ? 'es' : opts.format,
            // Do not let Rollup call Object.freeze() on namespace import objects
            // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
            freeze: false,
            // Respect tsconfig esModuleInterop when setting __esModule.
            esModule: Boolean(tsCompilerOptions?.esModuleInterop) || isEsm,
            name: opts.name || utils_1.safeVariableName(opts.name),
            sourcemap: false,
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
            plugin_node_resolve_1.default({
                /**
                 * Do not allow CJS imports for ESM output.
                 */
                modulesOnly: isEsm,
                /**
                 * For node output, do not resolve `browser` field.
                 */
                browser: opts.target !== 'node',
                /**
                 * Resolve only JSX, JSON, and .node files.
                 */
                extensions: ['.jsx', '.json', '.node'],
            }),
            /**
             * All bundled external modules need to be converted from CJS to ESM.
             */
            plugin_commonjs_1.default({
                /**
                 * CJS/ESM interop. Support Node's .cjs and .mjs spec.
                 */
                extensions: ['.js', '.cjs', '.mjs'],
                /**
                 * Allow require('my-package') === await import('my-package').
                 *
                 * The `modulesOnly` option of @rollup/plugin-node-resolve ensures that
                 * the compiler will throw if there is an issue.
                 */
                esmExternals: isEsm,
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
            plugin_json_1.default(),
            /**
             * Remove shebangs like #!/usr/bin/env node.
             */
            remove_shebang_1.removeShebang(),
            /**
             * In --legacy mode, use Babel to transpile to ES5.
             */
            opts.legacy &&
                babelPluginTsdx_1.babelPluginTsdx({
                    exclude: 'node_modules/**',
                    extensions: [...core_1.DEFAULT_EXTENSIONS, 'ts', 'tsx'],
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
            /**
             * Minify and compress with Terser for max DCE. Emit latest featureset.
             *
             * This is called before @rollup/replace-plugin to minimize the emitted
             * code it would need to search.
             */
            shouldMinify &&
                rollup_plugin_terser_1.terser({
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
            /**
             * If not in --legacy mode, ensure lodash imports are optimized in the
             * final bundle.
             */
            !opts.legacy &&
                rollup_plugin_1.optimizeLodashImports({
                    useLodashEs: isEsm || undefined,
                }),
            /**
             * In emitted output, map module specifiers like ./relative ➡
             * ./relative.cjs in file.cjs, ./relative ➡ ./relative.mjs in file.mjs,
             * etc.
             */
            {
                name: 'Match relative filepaths',
                async generateBundle(_, bundle) {
                    for (const [fileName, chunkInfo] of Object.entries(bundle)) {
                        if (!('code' in chunkInfo))
                            continue;
                        if (chunkInfo.imports || chunkInfo.dynamicImports) {
                            const { imports } = chunkInfo;
                            const fileExt = fileName.match(/\..+$/) || '';
                            const rewrittenImports = [];
                            const ast = this.parse(chunkInfo.code);
                            await estree_walker_1.default.asyncWalk(ast, {
                                async enter(node, parent, prop, index) {
                                    console.log({ node, parent, prop, index });
                                },
                            });
                            for (const chunkImport of imports) {
                                // console.log(this.getModuleInfo(chunkImport))
                                if (path_1.isAbsolute(chunkImport)) {
                                    rewrittenImports.push(`${chunkImport}${fileExt}`);
                                }
                                else {
                                    rewrittenImports.push(chunkImport);
                                }
                            }
                            chunkInfo.imports = rewrittenImports;
                            console.log(fileName, chunkInfo.imports);
                        }
                    }
                },
            },
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
                    if (!chunk.exports.length ||
                        chunk.exports.includes('default') ||
                        !isEsm) {
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
exports.createRollupConfig = createRollupConfig;
