import glob from 'fast-glob';

import { createConfig } from '@tszip/rollup-config';
import { getTszipConfig } from '../config/tszip';
import { rollup } from 'rollup';

/**
 * @todo Do not use a separate repo to generate Rollup configs.
 */
export const runRollup = async (action: 'build' | 'dev', minify = false) => {
  const filesToCheck = './dist/**/*.js';
  const files = await glob(filesToCheck);
  /**
   * Create a config for each entry point.
   */
  const configs = files.map((input: string) =>
    createConfig({
      action,
      input,
      minify,
    })
  );
  /**
   * Load the Rollup modifier from the tszip config.
   */
  const { rollup: rollupModifier } = await getTszipConfig();
  await Promise.all(
    configs.map(async (config) => {
      /**
       * Use the modified config if a modifier is provided.
       */
      if (rollupModifier) {
        config = await rollupModifier(config);
      }
      /**
       * Initialize Rollup and write the bundle(s).
       */
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
