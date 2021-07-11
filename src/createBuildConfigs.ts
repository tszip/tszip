import { RollupOptions, OutputOptions } from 'rollup';
import { TsdxOptions, NormalizedOpts } from './types';

import { createRollupConfig } from './createRollupConfig';

import glob from 'glob-promise';
import { safePackageName } from './utils';

export async function createBuildConfigs(
  opts: NormalizedOpts
): Promise<(RollupOptions & { output: OutputOptions })[]> {
  /**
   * Generate all forms of the entry points that will be needed.
   */
  const entryPoints = createAllEntryPoints(opts);
  const entryPointConfigs = await Promise.all(
    entryPoints.map(async (entryPoint) => {
      const packageName = safePackageName(opts.name);
      let outputName: string;
      switch (entryPoint.format) {
        case 'esm':
          outputName = `dist/${packageName}.mjs`;
          break;
        case 'cjs':
          outputName = `dist/${packageName}.cjs`;
          break;
        default:
          outputName = entryPoint.input;
          break;
      }
      return await createRollupConfig(entryPoint, outputName);
    })
  );

  const emittedFiles = await glob('dist/**/*.js');
  const emittedFileOptions = emittedFiles.map((input) => ({
    ...opts,
    format: 'esm',
    env: 'production',
    input,
  }));
  const emittedFileConfigs = await Promise.all(
    emittedFileOptions.map(async (options) => {
      const config = await createRollupConfig(options as TsdxOptions);
      /**
       * Overwrite input files.
       */
      config.output.file = options.input;
      return config;
    })
  );

  console.log(JSON.stringify(emittedFileConfigs, null, 2));

  const compilerPasses = [...entryPointConfigs, ...emittedFileConfigs];
  return compilerPasses;
}

/**
 * Create all the entry points, on a per-format basis, for the library.
 */
function createAllEntryPoints(
  opts: NormalizedOpts
): [TsdxOptions, ...TsdxOptions[]] {
  /**
   * The entry point emitted by TSC.
   */
  const input = 'dist/index.js';
  /**
   * Map it to all of the specified output formats (ESM, CJS, UMD, SystemJS,
   * etc.). Only the entry point needs to be specified this way.
   */
  return [
    opts.format.includes('cjs') && {
      ...opts,
      format: 'cjs',
      env: 'development',
      input,
    },
    opts.format.includes('cjs') && {
      ...opts,
      format: 'cjs',
      env: 'production',
      input,
    },
    opts.format.includes('esm') && { ...opts, format: 'esm', input },
    opts.format.includes('umd') && {
      ...opts,
      format: 'umd',
      env: 'development',
      input,
    },
    opts.format.includes('umd') && {
      ...opts,
      format: 'umd',
      env: 'production',
      input,
    },
    opts.format.includes('system') && {
      ...opts,
      format: 'system',
      env: 'development',
      input,
    },
    opts.format.includes('system') && {
      ...opts,
      format: 'system',
      env: 'production',
      input,
    },
  ].filter(Boolean) as [TsdxOptions, ...TsdxOptions[]];
}
