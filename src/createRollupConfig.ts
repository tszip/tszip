import { paths } from './constants';
import { RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';

import { extractErrors } from './errors/extractErrors';
import { TszipOptions } from './types';
import { resolveImports } from '@tszip/resolve-imports';
import { join } from 'path';

import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const REQUIRE_SHIM =
  `if(typeof require==='undefined')const require=await(async()=>{const{` +
  `createRequire:t}=await import("module");return t(import.meta.url)})();`;

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

  return {
    input: opts.input,
    output: {
      file: opts.output,
      format: 'es',
      freeze: false,
      esModule: true,
      // name: opts.name || safeVariableName(opts.name),
      sourcemap: false,
      exports: 'named',
    },
    /**
     * Everything except the entry point is external.
     */
    external: (id: string) => id !== opts.input,
    /**
     * Silence warnings.
     */
    onwarn: () => {},
    shimMissingExports: true,
    treeshake: {
      propertyReadSideEffects: false,
    },
    plugins: [
      sourceMaps(),
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
        transform: (code: string) => {
          /**
           * If no hashbang, skip.
           */
          if (!code.startsWith('#!')) {
            return null;
          }
          /**
           * Otherwise, trim first line.
           */
          return {
            code: code.slice(code.indexOf('\n')),
            map: null,
          };
        },
      },
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
            passes: 2,
          },
          ecma: 2020,
          module: true,
          toplevel: true,
        }),
      /**
       * Rewrite final emitted imports.
       */
      resolveImports(),
      {
        name: 'Shim require().',
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
      opts.input.endsWith('.css') &&
        postcss({
          plugins: [
            autoprefixer(),
            cssnano({
              preset: 'default',
            }),
          ],
          inject: false,
          extract: true,
        }),
      {
        name: 'Add shebang.',
        renderChunk: async (code: string, chunk: any) => {
          const entryPoint = chunk.facadeModuleId;
          const packageEntry = join(paths.appDist, 'index.js');

          if (entryPoint !== packageEntry) {
            return null;
          }

          code = `#!/bin/env node\n` + code;
          return {
            code,
            map: null,
          };
        },
      },
    ],
  };
}
