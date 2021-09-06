import glob from 'fast-glob';

import { createConfig } from '@tszip/rollup-config';
import { rollup } from 'rollup';

export const runRollup = async (action: 'build' | 'dev', minify = false) => {
  const filesToCheck = './dist/**/*.js';
  const files = await glob(filesToCheck);

  const configs = files.map((input: string) => {
    return createConfig({
      action,
      input,
      minify,
    });
  });

  await Promise.all(
    configs.map(async (config) => {
      const bundle = await rollup(config);
      if (config.output) {
        if (Array.isArray(config.output)) {
          await Promise.all(
            config.output.map(async (output) => await bundle.write(output))
          );
        } else {
          await bundle.write(config.output);
        }
      }
    })
  );
};

/** @todo implement */

// check for custom tszip.config.js
// let exportTsConfig = {
//   rollup(config: RollupOptions, _options: TszipOptions): RollupOptions {
//     return config;
//   },
// };

// if (existsSync(paths.appConfig)) {
//   exportTsConfig = require(paths.appConfig);
// }

// interface RollupPassArgs {
//   action: 'build' | 'dev';
//   minify: string;
// }
