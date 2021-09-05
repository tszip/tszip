import glob from 'glob-promise';

import { RollupOptions } from 'rollup';
import { TszipOptions } from '../types';
import { createConfig } from '@tszip/rollup-config';
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
  watch,
  minify = false,
}: {
  watch: boolean;
  minify?: boolean;
}) => {
  const filePattern = watch ? /^\.(css|[jt]sx?)$/ : /^\.(css|jsx?)$/;
  const filesToCheck = watch ? './src/index.ts' : './dist/**/*';
  const files: string[] = await glob(filesToCheck, { nodir: true });
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
      watch,
      minify,
    };

    const config = createConfig(
      watch
        ? {
            input,
            minify: false,
            action: 'watch',
          }
        : {
            input,
            minify,
            action: 'build',
          }
    );

    return exportTsConfig.rollup(config, options);
  });

  return configs;
};
