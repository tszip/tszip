import { RollupOptions, OutputOptions } from 'rollup';
import { concatAllArray } from 'jpjs';

import { paths } from './constants';
import { ExportTsOptions, NormalizedOpts } from './types';

import { createRollupConfig } from './createRollupConfig';
import { existsSync } from 'fs';

// check for custom tszip.config.js
let exportTsConfig = {
  rollup(config: RollupOptions, _options: ExportTsOptions): RollupOptions {
    return config;
  },
};

if (existsSync(paths.appConfig)) {
  exportTsConfig = require(paths.appConfig);
}

export async function createBuildConfigs(
  opts: NormalizedOpts
): Promise<Array<RollupOptions & { output: OutputOptions }>> {
  const allInputs = concatAllArray(
    opts.input.map((input: string) =>
      createAllFormats(opts, input).map(
        (options: ExportTsOptions, index: number) => ({
          ...options,
          // We want to know if this is the first run for each entryfile
          // for certain plugins (e.g. css)
          writeMeta: index === 0,
        })
      )
    )
  );

  return await Promise.all(
    allInputs.map(async (options: ExportTsOptions, index: number) => {
      // pass the full rollup config to tszip.config.js override
      const config = await createRollupConfig(options, index);
      return exportTsConfig.rollup(config, options);
    })
  );
}

function createAllFormats(
  opts: NormalizedOpts,
  input: string
): [ExportTsOptions, ...ExportTsOptions[]] {
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
  ].filter(Boolean) as [ExportTsOptions, ...ExportTsOptions[]];
}
