import { resolveImports } from '@tszip/resolve-imports';
import shebang from 'rollup-plugin-preserve-shebang';

const glob = require('glob-promise');

const REQUIRE_SHIM = `import{require}from'@tszip/esm-require';`;
// const SHEBANG_BANNER = `#!/usr/bin/env node\n$`;

export const requireShim = () => ({
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
});

const configs = async () => {
  const filesToOptimize = await glob('dist/**/*.js');
  return filesToOptimize.map((input) => ({
    input,
    output: {
      file: input,
      format: 'es',
    },
    external: (id) => id !== input,
    plugins: [requireShim(), shebang(), resolveImports()],
    onwarn: () => {},
  }));
};

export default configs;
