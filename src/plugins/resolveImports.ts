import { existsSync, readFileSync } from 'fs';
import { pathExistsSync } from 'fs-extra';
import { extname } from 'path';
import { resolve as resolveExports } from 'resolve.exports';
import { TszipOptions } from '../types';
import { generateImportPattern } from '../utils/filesystem';
import { getPackageJson } from '../utils/filesystem';
// import { createRequire } from 'module';
import resolve from 'resolve';

/**
 * Resolve every relative import in output to their entry points.
 *
 * TypeScript loves to leave things like `import { jsx } from
 * 'react/jsx-runtime` when react/jsx-runtime isn't a valid import
 * source:  react/jsx-runtime.js *is*.
 */
export const resolveImports = (opts: TszipOptions) => {
  const fileExtensions = [
    opts.format === 'esm' ? '.mjs' : null,
    opts.format === 'cjs' ? '.cjs' : null,
    '.js',
  ].filter(Boolean);

  return {
    name: 'Resolve final runtime imports to files',
    renderChunk: async (code: string, chunk: any) => {
      /**
       * Iterate over imports and rewrite all import sources to entry
       * points.
       */
      for (const chunkImport of chunk.imports) {
        /**
         * If the import already has a file extension, do not touch.
         */
        if (extname(chunkImport)) continue;

        let absEntryPoint = resolve.sync(chunkImport);

        // const require = createRequire(import.meta.url);
        // let absEntryPoint;
        // try {
        //   absEntryPoint = require.resolve(chunkImport);
        // } catch {
        //   absEntryPoint = require.resolve(join(chunkImport, 'index'));
        // }
        console.log({ chunkImport, absEntryPoint });

        /**
         * The absolute location of the module entry point.
         * `require.resolve` logic can be used to resolve the "vanilla"
         * entry point as the output will be ES, and then module-specific
         * extensions (.mjs, .cjs) will be tried.
         */
        const originalFileExt = extname(chunkImport);
        const absEntryWithoutExtension = absEntryPoint.replace(
          originalFileExt,
          ''
        );
        /**
         * Try to resolve ESM/CJS-specific extensions over .js when bundling
         * for those formats.
         */
        if (opts.format === 'esm' || opts.format === 'cjs') {
          for (const fileExtension of fileExtensions) {
            const withExtension = absEntryWithoutExtension + fileExtension;
            if (pathExistsSync(withExtension)) {
              absEntryPoint = withExtension;
              break;
            }
          }
        }

        const packageJsonPath = getPackageJson(absEntryPoint);
        if (!packageJsonPath || !existsSync(packageJsonPath)) continue;

        /**
         * Check if there's `exports` package.json logic. if there is, it
         * controls the flow.
         */
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        const exportsFieldResolution = resolveExports(packageJson, chunkImport);

        /**
         * If there is `exports` logic that resolves this import, do not
         * rewrite it.
         */
        if (exportsFieldResolution) continue;

        /**
         * Remove unnecessary absolute specification.
         */
        const relativeEntryPoint = absEntryPoint.slice(
          absEntryPoint.indexOf(chunkImport)
        );
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
  };
};
