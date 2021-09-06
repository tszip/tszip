import glob from 'glob-promise';

import { createBuildConfig, createDevConfig } from '@tszip/rollup-config';
import { RollupOptions } from 'rollup';
import { TszipOptions } from '../types';
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
  action,
  minify = false,
}: {
  action: 'build' | 'dev';
  minify?: boolean;
}) => {
  const filePattern = /^\.jsx?$/;
  const filesToCheck = './dist/**/*';
  const files = await glob(filesToCheck, { nodir: true });
  const filesToOptimize = files.filter(
    (file: string) =>
      /**
       * Do not feed .d.ts to Rollup directly. Only compile files we can consume
       * (JS, TS, CSS).
       */
      !file.endsWith('.d.ts') && filePattern.test(extname(file))
  );

  const configs = filesToOptimize.map((input: string) => {
    const options = {
      input,
      minify,
    };

    const config =
      action === 'build'
        ? createBuildConfig({
            input,
            minify,
          })
        : createDevConfig({ input });

    return exportTsConfig.rollup(config, options);
  });

  return configs;
};
