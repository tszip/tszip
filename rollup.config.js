import glob from 'tiny-glob';
/**
 * Actually have to pull in compiled TS ouput for now.
 */
// import { removeShebang } from './dist/plugins/removeShebang.js';
// import { resolveImports } from './dist/plugins/resolveImports.js';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const config = async () => {
  const input = 'src/index.ts';
  const fileConfig = {
    input,
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.bootstrap.json',
      }),
      /**
       * All bundled external modules need to be converted from CJS to ESM.
       */
      commonjs({
        module: 'commonjs',
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
      }),
      resolve(),
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
        transform(code) {
          let reg = /^#!(.*)/;
          code = code.replace(reg, '');

          return {
            code,
            map: null,
          };
        },
      },
    ],
  };

  return fileConfig;
};

export default config;
