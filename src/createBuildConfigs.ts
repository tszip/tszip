import { RollupOptions, OutputOptions } from 'rollup';
import { concatAllArray } from 'jpjs';

import { paths } from './constants';
import { TszipOptions, NormalizedOpts } from './types';

import { createRollupConfig } from './createRollupConfig';
import { existsSync } from 'fs';
import { extname, resolve } from 'path';
import { renameExtension } from './utils/filesystem';

const glob = require('glob-promise');

// check for custom tszip.config.js
let exportTsConfig = {
  rollup(config: RollupOptions, _options: TszipOptions): RollupOptions {
    return config;
  },
};

if (existsSync(paths.appConfig)) {
  exportTsConfig = require(paths.appConfig);
}

export async function createBuildConfigs(
  opts: NormalizedOpts
): Promise<Array<RollupOptions & { output: OutputOptions }>> {
  const distFiles = await glob('./dist/**/*', { nodir: true });
  const filesToOptimize = distFiles.filter((file: string) =>
    /^\.(css|js|jsx)/.test(extname(file))
  );

  // const configPromises = filesToOptimize.map(async (input) => {
  //   const configs = createAllFormats(opts, resolve(input));
  //   const rollupConfigs = [];
  //   for await (const config of configs) {
  //     const rollupConfig = await createRollupConfig(config);
  //     rollupConfigs.push(exportTsConfig.rollup(rollupConfig, opts));
  //   }
  // });

  const allInputs = concatAllArray(
    filesToOptimize.map((input: string) =>
      createAllFormats(opts, resolve(input)).map(
        (options: TszipOptions, index: number) => ({
          ...options,
          // We want to know if this is the first run for each entryfile
          // for certain plugins (e.g. css)
          writeMeta: index === 0,
        })
      )
    )
  );

  return await Promise.all(
    allInputs.map(async (options: TszipOptions) => {
      // pass the full rollup config to tszip.config.js override
      const config = await createRollupConfig(options);
      return exportTsConfig.rollup(config, options);
    })
  );
}

function createAllFormats(
  opts: NormalizedOpts,
  input: string
): [TszipOptions, ...TszipOptions[]] {
  return [
    {
      ...opts,
      input,
      output: renameExtension(input, '.mjs'),
      format: 'esm',
      env: 'production',
    },
  ];
}
