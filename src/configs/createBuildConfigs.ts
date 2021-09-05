import glob from 'glob-promise';

import { NormalizedOpts, TszipOptions } from '../types';
import { RollupOptions } from 'rollup';
import { createRollupConfig } from './createRollupConfig';
import { existsSync } from 'fs';
import { extname } from 'path';
import { paths } from '../constants';

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

  const configs = await Promise.all(
    filesToOptimize.map(async (input: string) => {
      const options = {
        input,
        output: input,
      };
      const config = await createRollupConfig(options);
      return exportTsConfig.rollup(config, options);
    })
  );

  return configs;
}
