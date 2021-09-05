import logError from '../log/error';

import { RollupOptions, rollup } from 'rollup';
import { TszipOptions } from '../types';
import { cleanDistFolder } from '../lib/filesystem';
import { createBuildConfigs } from '../configs/createBuildConfigs';
import { createProgressEstimator } from '../configs/createProgressEstimator';
import { runTsc } from '../plugins/tsc';

export const build = async (opts: TszipOptions) => {
  const progressIndicator = await createProgressEstimator();

  await progressIndicator(cleanDistFolder(), 'Cleaning dist/.');
  await runTsc({
    tsconfig: opts.tsconfig,
    transpileOnly: opts.transpileOnly,
  });

  const buildConfigs = await createBuildConfigs({
    watch: false,
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
