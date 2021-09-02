import { safeVariableName, external } from './utils';
import { paths } from './constants';
import { RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import ts from 'typescript';

import { extractErrors } from './errors/extractErrors';
import { babelPluginExportTs } from './babelPluginExportTs';
import { TszipOptions } from './types';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';

/**
 * These packages will not be resolved by Rollup and will be left as imports.
 */
const EXTERNAL_PACKAGES = ['react', 'react-native'];

const errorCodeOpts = {
  errorMapFilePath: paths.appErrorsJson,
};

export async function createRollupConfig(
  opts: TszipOptions
): Promise<RollupOptions> {
  const findAndRecordErrorCodes = await extractErrors({
    ...errorCodeOpts,
    ...opts,
  });

  const isEsm = opts.format.includes('es') || opts.format.includes('esm');

  const shouldMinify =
    opts.minify !== undefined
      ? opts.minify
      : opts.env === 'production' || isEsm;

  // let formatString = ['esm', 'cjs'].includes(opts.format) ? '' : opts.format;
  // let fileExtension = opts.format === 'esm' ? 'mjs' : 'cjs';

  // const outputName = [
  //   `${paths.appDist}/${safePackageName(opts.name)}`,
  //   formatString,
  //   opts.env,
  //   shouldMinify ? 'min' : '',
  //   fileExtension,
  // ]
  //   .filter(Boolean)
  //   .join('.');

  const tsconfigPath = opts.tsconfig || paths.tsconfigJson;
  // borrowed from https://github.com/facebook/create-react-app/pull/7248
  const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;
  // borrowed from https://github.com/ezolenko/rollup-plugin-typescript2/blob/42173460541b0c444326bf14f2c8c27269c4cb11/src/parse-tsconfig.ts#L48
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJSON,
    ts.sys,
    './'
  ).options;

  const PRODUCTION = process.env.NODE_ENV === 'production';

  return {
    // Tell Rollup the entry point to the package
    input: opts.input,
    // Tell Rollup which packages to ignore
    external: (id: string) => {
      // bundle in polyfills as tszip can't (yet) ensure they're installed as deps
      if (id.startsWith('regenerator-runtime')) {
        return false;
      }

      if (EXTERNAL_PACKAGES.includes(id)) {
        return true;
      }

      return external(id);
    },
    // Minimize runtime error surface as much as possible
    shimMissingExports: false,
    // Rollup has treeshaking by default, but we can optimize it further...
    treeshake: {
      // We assume reading a property of an object never has side-effects.
      // This means tszip WILL remove getters and setters defined directly on objects.
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
      file: opts.output,
      // Pass through the file format
      format: 'es',
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
        async transform(code: string) {
          try {
            await findAndRecordErrorCodes(code);
          } catch (e) {
            return null;
          }
          return { code, map: null };
        },
      },
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
        include:
          opts.format === 'umd' || isEsm
            ? /\/node_modules\//
            : /\/regenerator-runtime\//,
      }),
      /**
       * Convert JSON to ESM.
       */
      json(),
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
        transform(code: string) {
          let reg = /^#!(.*)/;
          code = code.replace(reg, '');

          return {
            code,
            map: null,
          };
        },
      },
      /**
       * In --legacy mode, use Babel to transpile to ES5.
       */
      opts.legacy &&
        babelPluginExportTs({
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
       * Replace process.env.NODE_ENV variable, preventing assignment. Runs
       * before Terser for DCE (`if (...)` => `if (false)` => removed).
       */
      opts.env && {
        name: 'Replace process.NODE_ENV',
        renderChunk: async (code: string, _: any) => {
          return {
            code: code.replace(
              /process\.env\.NODE_ENV(?!\s*=)/g,
              JSON.stringify(PRODUCTION ? 'production' : 'development')
            ),
            map: null,
          };
        },
      },
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
       * If not in --legacy mode, ensure lodash imports are optimized in the
       * final bundle.
       */
      !opts.legacy &&
        optimizeLodashImports({
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
        renderChunk: async (code: string, chunk: any) => {
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
