import logError from '../log/error';

import { RollupOptions, rollup } from 'rollup';
import { TszipOptions } from '../types';
import { cleanDistFolder } from '../utils/filesystem';
import { createBuildConfigs } from '../configs/createBuildConfigs';
import { createProgressEstimator } from '../configs/createProgressEstimator';
import { runTsc } from '../plugins/simpleTs';

export const build = async (opts: TszipOptions) => {
  const progressIndicator = await createProgressEstimator();

  await progressIndicator(cleanDistFolder(), 'Cleaning dist/.');
  await runTsc({
    tsconfig: opts.tsconfig,
    transpileOnly: opts.transpileOnly,
  });

  const dev = opts.noMinify || opts.transpileOnly;

  const buildConfigs = await createBuildConfigs({
    ...opts,
    watch: false,
    env: dev ? 'development' : 'production',
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
