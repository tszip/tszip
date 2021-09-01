import resolveExports from 'resolve.exports';
import { safeVariableName } from './utils';
import { paths } from './constants';
import { terser } from 'rollup-plugin-terser';
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
// import replace from '@rollup/plugin-replace';
import resolvePlugin from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import ts from 'typescript';
import { extractErrors } from './errors/extractErrors';
import { babelPluginTsdx } from './babelPluginTsdx';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import { extname, resolve, sep } from 'path';
import { existsSync, readFileSync } from 'fs';
/**
 * A crude RegExp to match the `from 'import-source'` part of import statements,
 * or a require(...) call.
 */
const generateImportPattern = (importSource) => new RegExp(`(from|require\\()\\s*['"]${importSource.replace('.', '\\.')}['"]`, 'g');
/**
 * Get the package.json for a given absolute entry point.
 */
function getPackageJson(absPath) {
    const parts = absPath.split('node_modules');
    const rootPath = parts[0];
    if (parts.length < 2)
        return null;
    const moduleParts = parts[1].split(sep);
    /**
     * node_modules/name => name
     * node_modules/@test/test => @test/test
     */
    const moduleName = moduleParts[1].startsWith('@')
        ? moduleParts.slice(1, 3).join(sep)
        : moduleParts[1];
    return resolve(rootPath, 'node_modules', moduleName, 'package.json');
}
/**
 * These packages will not be resolved by Rollup and will be left as imports.
 */
const EXTERNAL_PACKAGES = ['react', 'react-native'];
const errorCodeOpts = {
    errorMapFilePath: paths.appErrorsJson,
};
export async function createRollupConfig(opts
// entryPoint?: string
) {
    const findAndRecordErrorCodes = await extractErrors({
        ...errorCodeOpts,
        ...opts,
    });
    const isEsm = opts.format.includes('es') || opts.format.includes('esm');
    const shouldMinify = opts.minify !== undefined
        ? opts.minify
        : opts.env === 'production' || isEsm;
    const tsconfigPath = opts.tsconfig || paths.tsconfigJson;
    // borrowed from https://github.com/facebook/create-react-app/pull/7248
    const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;
    // borrowed from https://github.com/ezolenko/rollup-plugin-typescript2/blob/42173460541b0c444326bf14f2c8c27269c4cb11/src/parse-tsconfig.ts#L48
    const tsCompilerOptions = ts.parseJsonConfigFileContent(tsconfigJSON, ts.sys, './').options;
    const PRODUCTION = process.env.NODE_ENV === 'production';
    const fileExtensions = [
        opts.format === 'esm' ? '.mjs' : null,
        opts.format === 'cjs' ? '.cjs' : null,
        '.js',
    ].filter(Boolean);
    return {
        // Tell Rollup the entry point to the package
        input: opts.input,
        // Tell Rollup which packages to ignore
        external: (id) => {
            const resolvedId = resolve(id);
            const resolvedEntry = resolve(opts.input);
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
            if (EXTERNAL_PACKAGES.includes(id)) {
                return true;
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
            name: opts.name || safeVariableName(opts.name),
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
            resolvePlugin({
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
            commonjs({
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
            json(),
            /**
             * Remove shebangs like #!/usr/bin/env node.
             */
            {
                name: 'Remove shebang',
                transform(code) {
                    let reg = /^#!(.*)/;
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
            typescript({
                typescript: ts,
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
                        declaration: false,
                        declarationMap: false,
                    },
                },
                check: !opts.transpileOnly,
                useTsconfigDeclarationDir: Boolean(tsCompilerOptions?.declarationDir),
            }),
            /**
             * In --legacy mode, use Babel to transpile to ES5.
             */
            opts.legacy &&
                babelPluginTsdx({
                    exclude: 'node_modules/**',
                    extensions: [...DEFAULT_BABEL_EXTENSIONS, 'ts', 'tsx'],
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
                terser({
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
            optimizeLodashImports({
                useLodashEs: isEsm || undefined,
            }),
            /**
             * Replace process.env.NODE_ENV variable, preventing assignment.
             */
            opts.env && {
                name: 'Rewrite NODE_ENV',
                renderChunk: async (code, _) => {
                    return {
                        code: code.replace(/process\.env\.NODE_ENV(?!\s*=)/g, JSON.stringify(PRODUCTION ? 'production' : 'development')),
                        map: null,
                    };
                },
            },
            /**
             * If not in --legacy mode, ensure lodash imports are optimized in the
             * final bundle.
             */
            !opts.legacy &&
                optimizeLodashImports({
                    useLodashEs: isEsm || undefined,
                }),
            /**
             * Resolve every relative import in output to their entry points.
             *
             * TypeScript loves to leave things like `import { jsx } from
             * 'react/jsx-runtime` when react/jsx-runtime isn't a valid import
             * source:  react/jsx-runtime.js *is*.
             */
            {
                name: 'Resolve final runtime imports to files',
                renderChunk: async (code, chunk) => {
                    /**
                     * Iterate over imports and rewrite all import sources to entry
                     * points.
                     */
                    for (const chunkImport of chunk.imports) {
                        /**
                         * If the import already has a file extension, do not touch.
                         */
                        if (extname(chunkImport))
                            continue;
                        /**
                         * The absolute location of the module entry point.
                         * `require.resolve` logic can be used to resolve the "vanilla"
                         * entry point as the output will be ES, and then module-specific
                         * extensions (.mjs, .cjs) will be tried.
                         */
                        let absEntryPoint = require.resolve(chunkImport);
                        const originalFileExt = extname(absEntryPoint);
                        const absEntryWithoutExtension = absEntryPoint.replace(originalFileExt, '');
                        /**
                         * Try to resolve ESM/CJS-specific extensions over .js when bundling
                         * for those formats.
                         */
                        if (opts.format === 'esm' || opts.format === 'cjs') {
                            for (const fileExtension of fileExtensions) {
                                const withExtension = absEntryWithoutExtension + fileExtension;
                                if (existsSync(withExtension)) {
                                    absEntryPoint = withExtension;
                                    break;
                                }
                            }
                        }
                        const packageJsonPath = getPackageJson(absEntryPoint);
                        if (!packageJsonPath || !existsSync(packageJsonPath))
                            continue;
                        /**
                         * Check if there's `exports` package.json logic. if there is, it
                         * controls the flow.
                         */
                        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
                        const packageJson = JSON.parse(packageJsonContent);
                        const exportsFieldResolution = resolveExports.resolve(packageJson, chunkImport);
                        /**
                         * If there is `exports` logic that resolves this import, do not
                         * rewrite it.
                         */
                        if (exportsFieldResolution)
                            continue;
                        /**
                         * Remove unnecessary absolute specification.
                         */
                        const relativeEntryPoint = absEntryPoint.slice(absEntryPoint.indexOf(chunkImport));
                        /**
                         * The pattern matching the "from ..." import statement for this
                         * import.
                         */
                        const importPattern = generateImportPattern(chunkImport);
                        /**
                         * Read the matched import/require statements and replace them.
                         */
                        const matches = code.match(importPattern) ?? [];
                        for (const match of matches) {
                            const rewritten = match.replace(chunkImport, relativeEntryPoint);
                            code = code.replace(match, rewritten);
                        }
                    }
                    return {
                        code,
                        map: null,
                    };
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
