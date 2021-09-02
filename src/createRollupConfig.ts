import { safeVariableName } from './utils';
import { paths } from './constants';
import { RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';

import { extractErrors } from './errors/extractErrors';
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

  const shouldMinify = !opts.transpileOnly && !opts.noMinify;
  const PRODUCTION = process.env.NODE_ENV === 'production';

  return {
    input: opts.input,
    /**
     * Everything except the entry point is external.
     */
    external: (id: string) => id !== opts.input,
    shimMissingExports: true,
    treeshake: {
      propertyReadSideEffects: false,
    },
    output: {
      file: opts.output,
      format: 'es',
      freeze: false,
      esModule: true,
      name: opts.name || safeVariableName(opts.name),
      sourcemap: false,
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
          code = code.trim();

          if (!code.startsWith('#!')) {
            return null;
          }

          code = code.replace(/^#!(.*)/, '');
          return {
            code,
            map: null,
          };
        },
      },
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
          ecma: 2020,
          module: true,
          toplevel: true,
        }),
      /**
       * If not in --legacy mode, ensure lodash imports are optimized in the
       * final bundle.
       */
      optimizeLodashImports({
        useLodashEs: true,
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
          if (code.includes('require(') || code.includes('require.')) {
            code = REQUIRE_SHIM + code;
          }

          return {
            code,
            map: null,
          };
        },
      },
    ],
  };
}
