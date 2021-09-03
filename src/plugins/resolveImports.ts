import { existsSync, readFileSync } from 'fs';
import { dirname, extname, isAbsolute, relative } from 'path';
import { resolve as resolveExports } from 'resolve.exports';
import { TszipOptions } from '../types';
import { generateImportPattern, renameExtension } from '../utils/filesystem';
import { getPackageJson } from '../utils/filesystem';
// import { createRequire } from 'module';
import fs from 'fs-extra';
import resolve from 'resolve';

/**
 * Resolve every relative import in output to their entry points.
 *
 * TypeScript loves to leave things like `import { jsx } from
 * 'react/jsx-runtime` when react/jsx-runtime isn't a valid import
 * source:  react/jsx-runtime.js *is*.
 */
export const resolveImports = (opts: TszipOptions) => {
  const fileExtensions = ['.mjs', '.js', '.jsx', '.cjs'];

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
        for (const fileExtension of fileExtensions) {
          const withExtension = absEntryWithoutExtension + fileExtension;
          if (fs.pathExistsSync(withExtension)) {
            absEntryPoint = withExtension;
            break;
          }
        }
        /**
         * The pattern matching the "from ..." import statement for this
         * import.
         */
        let importToReplace;
        /**
         * The path to replace this import with.
         */
        let importReplacement;
        /**
         * Crawl package.json.
         */
        const packageJsonPath = getPackageJson(absEntryPoint);
        if (packageJsonPath && existsSync(packageJsonPath)) {
          /**
           * Check if there's `exports` package.json logic. if there is, it
           * controls the flow.
           */
          const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
          const packageJson = JSON.parse(packageJsonContent);
          const exportsFieldResolution = resolveExports(
            packageJson,
            chunkImport
          );
          /**
           * If there is `exports` logic that resolves this import, do not
           * rewrite it.
           */
          if (exportsFieldResolution) continue;
          importToReplace = chunkImport;
          importReplacement = absEntryPoint.slice(
            absEntryPoint.indexOf(chunkImport)
          );
        } else {
          /**
           * If package.json not found, bail if the path is relative (implies
           * builtin, i.e. { absEntryPoint: 'path' }).
           */
          if (!isAbsolute(absEntryPoint)) continue;
          /**
           * Otherwise, this is a relative import specified absolutely by
           * Rollup.
           */
          const baseDir = dirname(opts.input);
          let relativeEntry = relative(baseDir, absEntryPoint);
          if (!relativeEntry.startsWith('.')) {
            relativeEntry = './' + relativeEntry;
          }
          const relativeImportNoExt = renameExtension(relativeEntry, '');
          importToReplace = relativeImportNoExt;
          /**
           * ./path/to/module/index will be in TS output as ./path/to/module.
           */
          if (importToReplace.endsWith('/index')) {
            importToReplace = importToReplace.slice(0, -'/index'.length);
          }
          importReplacement = `${relativeImportNoExt}.mjs`;
          // console.log(opts.input, { baseDir, relativeImportNoExt });
          // console.log({ importToReplace, importReplacement });
          // console.log(opts.input, {
          //   absEntryPoint,
          //   importToReplace,
          //   importReplacement,
          // });
        }
        if (!importToReplace || !importReplacement) continue;
        /**
         * Read the matched import/require statements and replace them.
         */
        const importPattern = generateImportPattern(importToReplace);
        const matches = code.match(importPattern) ?? [];
        for (const match of matches) {
          const rewritten = match.replace(importToReplace, importReplacement);
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
