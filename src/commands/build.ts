import logError from '../log/error';

import { TszipOptions } from '../types';
import { cleanDistFolder } from '../lib/filesystem';
import { createProgressEstimator } from '../config/createProgressEstimator';
import { runRollup } from './rollup';
import { runTsc } from './tsc';

export const build = async (opts: TszipOptions) => {
  const progressIndicator = await createProgressEstimator();

  await progressIndicator(cleanDistFolder(), 'Cleaning dist/.');
  await runTsc({
    tsconfig: opts.tsconfig,
    transpileOnly: opts.transpileOnly,
  });

  const minify = !opts.transpileOnly && !opts.noMinify;

  try {
    await progressIndicator(
      runRollup('build', minify),
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
