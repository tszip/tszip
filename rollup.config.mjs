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

/**
 * Break glass in case of emergency.
 */

// await (async()=>{if(void 0===globalThis.require){const{default:e}=await import("module");globalThis.require=e.createRequire(import.meta.url)}})();
//
// @todo Replace with @tszip/rollup-config reference.
// const REQUIRE_SHIM = `await (async()=>{if(void 0===globalThis.require){const{default:e}=await import("module");globalThis.require=e.createRequire(import.meta.url)}})();\n`;
//
// const requireShim = () => ({
//   name: 'Shim require().',
//   renderChunk: async (code, chunk) => {
//     /**
//      * Skip if the shim already exists, or if we're emitting this polyfill.
//      */
//     if (
//       chunk.imports.includes('@tszip/esm-require') ||
//       chunk.facadeModuleId.endsWith('esm-require/dist/index.js')
//     ) {
//       return null;
//     }

//     if (code.startsWith('#!')) {
//       const afterNewline = code.indexOf('\n') + 1;
//       const shebang = code.slice(0, afterNewline);
//       return {
//         code: shebang + REQUIRE_SHIM + code.slice(afterNewline),
//         map: null,
//       };
//     }

//     return {
//       code: REQUIRE_SHIM + code,
//       map: null,
//     };
//   },
// });
