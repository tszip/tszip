import logError from '../log/error';

import { RollupOptions, rollup } from 'rollup';
import { TszipOptions } from '../types';
import { cleanDistFolder } from '../lib/filesystem';
import { createBuildConfigs } from '../config/createRollupConfigs';
import { createProgressEstimator } from '../config/createProgressEstimator';
import { runTsc } from './tsc';

export const build = async (opts: TszipOptions) => {
  const progressIndicator = await createProgressEstimator();

  await progressIndicator(cleanDistFolder(), 'Cleaning dist/.');
  await runTsc({
    tsconfig: opts.tsconfig,
    transpileOnly: opts.transpileOnly,
  });

  const minify = !opts.transpileOnly && !opts.noMinify;

  const buildConfigs = await createBuildConfigs({
    action: 'build',
    minify,
  });

  try {
    await progressIndicator(
      Promise.all(
        buildConfigs.map(async (buildConfig) => {
          if (buildConfig.output) {
            const outputs: RollupOptions[] = Array.isArray(buildConfig.output)
              ? buildConfig.output
              : [buildConfig.output];

            return await Promise.all(
              outputs.map(async (output) => {
                const bundle = await rollup(buildConfig);
                return await bundle.write(output);
              })
            );
          }
          return null;
        })
      ),
      'JS ➡ JS: Resolving imports and minifying.'
    );
    /**
     * Remove old index.js.
     */
    // await cleanOldJS();
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};
