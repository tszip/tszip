import glob from 'glob-promise';

import { RollupOptions } from 'rollup';
import { TszipOptions } from '../types';
import { createRollupConfig } from './createRollupConfig';
import { existsSync } from 'fs';
import { extname } from 'path';
import { paths } from '../lib/constants';

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
  watch = false,
}: {
  watch: boolean;
}) => {
  const filePattern = watch ? /^\.(css|[jt]sx?)/ : /^\.(css|jsx?)/;
  const filesToCheck = watch ? './src/**/*' : './dist/**/*';
  const distFiles: string[] = await glob(filesToCheck, { nodir: true });
  const filesToOptimize = distFiles.filter((file: string) =>
    filePattern.test(extname(file))
  );

  const configs = await Promise.all(
    filesToOptimize.map(async (input: string) => {
      const options = {
        input,
        watch,
      };
      const config = await createRollupConfig(options);
      // console.log(config);
      return exportTsConfig.rollup(config, options);
    })
  );

  return configs;
};
