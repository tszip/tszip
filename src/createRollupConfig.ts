import { paths } from './constants';
import { RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';

import { extractErrors } from './errors/extractErrors';
import { TszipOptions } from './types';
import { resolveImports } from '@tszip/resolve-imports';

import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// @ts-ignore
import shebang from 'rollup-plugin-preserve-shebang';

const REQUIRE_SHIM = `import{require}from'@tszip/esm-require';`;

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
      shebang(),
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
      resolveImports(),
      {
        name: 'Shim require().',
        renderChunk: async (code) => {
          if (code.includes('require(') || code.includes('require.')) {
            let banner = REQUIRE_SHIM;
            if (code.startsWith('#!')) {
              const afterNewline = code.indexOf('\n') + 1;
              const shebang = code.slice(0, afterNewline);
              code = code.slice(afterNewline);
              banner = shebang + REQUIRE_SHIM;
            }
            code = banner + code;
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
    ],
  };
}
