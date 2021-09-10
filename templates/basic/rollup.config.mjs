/**
 * Import first for require() shim.
 */
import { resolveImports } from '@tszip/resolve-imports';

import glob from 'fast-glob';
import shebang from 'rollup-plugin-preserve-shebang';

const configs = async () => {
  const filesToOptimize = await glob('dist/**/*.js');
  return filesToOptimize.map((input) => ({
    input,
    output: {
      file: input,
      format: 'es',
    },
    external: (id) => id !== input,
    plugins: [resolveImports(), shebang()],
    onwarn: () => {},
  }));
};

export default configs;
