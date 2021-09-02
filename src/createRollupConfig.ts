import { safeVariableName } from './utils';
import { paths } from './constants';
import { RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core';

import { extractErrors } from './errors/extractErrors';
import { babelPluginExportTs } from './babelPluginExportTs';
import { TszipOptions } from './types';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import { resolveImports } from './plugins/resolveImports';

const REQUIRE_SHIM =
  `const require=await(async()=>{const{createRequire:t}=await import("module");` +
  `return t(import.meta.url)})();`;

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

  const shouldMinify = !opts.transpileOnly && !opts.noMinify;

  const PRODUCTION = process.env.NODE_ENV === 'production';

  return {
    // Tell Rollup the entry point to the package
    input: opts.input,
    /**
     * Everything except the entry point is external.
     */
    external: (id: string) => {
      return id !== opts.input;
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
      esModule: true,
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
            // passes: 10,
          },
          ecma: opts.legacy ? 5 : 2020,
          module: true,
          toplevel: true,
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
       * Rewrite final emitted imports.
       */
      resolveImports({
        ...opts,
        format: 'esm',
      }),
      {
        name: 'Shim require(),',
        renderChunk: async (code: string, _: any) => {
          if (code.includes('require(')) {
            code = REQUIRE_SHIM + code;
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
      // {
      //   name: 'Ensure default exports',
      //   renderChunk: async (code: string, chunk: any) => {
      //     if (chunk.exports.includes('default') || !isEsm) {
      //       return null;
      //     }

      //     return {
      //       code: `${code}\nexport default {};`,
      //       map: null,
      //     };
      //   },
      // },
    ],
  };
}
