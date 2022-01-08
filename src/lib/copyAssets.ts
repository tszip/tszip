import { extname, join, relative } from 'path';
import { ProgressEstimator } from 'progress-estimator';
import { copy } from 'fs-extra';
import { createProgressEstimator } from '../log/progressEstimator';

import glob from 'glob-promise';

export const copyAssets = async (progressIndicator?: ProgressEstimator) => {
  if (!progressIndicator) {
    progressIndicator = await createProgressEstimator();
  }

  const srcFiles = await glob('src/**/*', { nodir: true });
  await progressIndicator(
    Promise.all(
      srcFiles
        .filter(
          (file: string) => !/^\.(ts|tsx|js|jsx|json)$/.test(extname(file))
        )
        .map(
          async (file: string) =>
            await copy(file, join('dist', relative('src', file)))
        )
    ),
    'Copying all non-TS and non-JS files to dist/.'
  );
};
