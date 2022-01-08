import TscWatchClient from 'tsc-watch/client';
import chalk from 'chalk';

import { cleanDistFolder } from '../lib/filesystem';
import { copyAssets } from '../lib/copyAssets';
import { createProgressEstimator } from '../log/progressEstimator';
import { runRollup } from './rollup';

const CONSIDER_LEAVING_A_COMMENT = `
If you want to help make tszip faster, consider leaving a comment in support
of TypeScript natively resolving file extensions for ESM output:

${chalk.blue('https://github.com/microsoft/TypeScript/issues/42151')}
`;

export const dev = async () => {
  await cleanDistFolder();
  const watcher = new TscWatchClient();

  watcher.on('success', async () => {
    console.log();
    const progressEstimator = await createProgressEstimator();

    await progressEstimator(
      runRollup('dev', false),
      'Resolving imports in compiled TypeScript...'
    );

    await copyAssets(progressEstimator);

    console.log(chalk.dim(CONSIDER_LEAVING_A_COMMENT));
    console.log(chalk.bold(chalk.green('Compiled successfully.')));
  });

  watcher.on('compile_errors', async () => {
    console.log();
    console.log(chalk.bold(chalk.red('Failed to compile.')));
  });

  watcher.start();
};
