import glob from 'glob-promise';

import { RollupOptions } from 'rollup';
import { TszipOptions } from '../types';
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

export const createBuildConfigs = async ({
  env = 'development',
  watch = false,
}: {
  env: 'development' | 'production';
  watch: boolean;
}) => {
  const distFiles: string[] = await glob('./dist/**/*', { nodir: true });
  const filesToOptimize = distFiles.filter((file: string) =>
    /^\.(css|js|jsx)/.test(extname(file))
  );

  const configs = await Promise.all(
    filesToOptimize.map(async (input: string) => {
      const options = {
        input,
        output: input,
        env,
        watch,
      };
      const config = await createRollupConfig(options);
      return exportTsConfig.rollup(config, options);
    })
  );

  return configs;
};
