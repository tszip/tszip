import glob from 'fast-glob';

import { createConfig } from '@tszip/rollup-config';
import { rollup } from 'rollup';

/**
 * @todo Do not use a separate repo to generate Rollup configs.
 */
export const runRollup = async (action: 'build' | 'dev', minify = false) => {
  const filesToCheck = './dist/**/*.js';
  const files = await glob(filesToCheck);
  // console.log({ files }, Date.now());

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
