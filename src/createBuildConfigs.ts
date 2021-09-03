import { RollupOptions } from 'rollup';
import { paths } from './constants';
import { TszipOptions, NormalizedOpts } from './types';
import { createRollupConfig } from './createRollupConfig';
import { existsSync } from 'fs';
import { extname } from 'path';
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
  _: NormalizedOpts
): Promise<RollupOptions[]> {
  const distFiles: string[] = await glob('./dist/**/*', { nodir: true });
  const filesToOptimize = distFiles.filter((file: string) =>
    /^\.(css|js|jsx)/.test(extname(file))
  );

  const inputs: TszipOptions[] = filesToOptimize.map((input) => ({
    input,
    output: renameExtension(input, '.mjs'),
  }));

  const configs = await Promise.all(
    inputs.map(async (options: TszipOptions) => {
      const config = await createRollupConfig(options);
      return exportTsConfig.rollup(config, options);
    })
  );

  return configs;
}

// function createAllFormats(
//   opts: NormalizedOpts,
//   input: string
// ): [TszipOptions, ...TszipOptions[]] {
//   return [
//     {
//       ...opts,
//       input,
//       output: renameExtension(input, '.mjs'),
//       format: 'esm',
//       env: 'production',
//     },
//   ];
// }
