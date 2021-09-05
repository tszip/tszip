import chalk from 'chalk';
import execa from 'execa';
import logError from '../log/error';
import ora from 'ora';

import { RollupWatchOptions, watch as rollupWatch } from 'rollup';
import { WatchOpts } from '../types';
import { clearConsole } from '../utils';
import { createBuildConfigs } from '../configs/createBuildConfigs';
import { moveTypes } from '../deprecated';

export const watch = async (opts: WatchOpts) => {
  const buildConfigs: RollupWatchOptions[] = await createBuildConfigs({
    watch: true,
  });

  type Killer = execa.ExecaChildProcess | null;

  let firstTime = true;
  let successKiller: Killer = null;
  let failureKiller: Killer = null;

  function run(command?: string) {
    if (!command) {
      return null;
    }

    const [exec, ...args] = command.split(' ');
    return execa(exec, args, {
      stdio: 'inherit',
    });
  }

  function killHooks() {
    return Promise.all([
      successKiller ? successKiller.kill('SIGTERM') : null,
      failureKiller ? failureKiller.kill('SIGTERM') : null,
    ]);
  }

  const spinner = ora().start();
  rollupWatch(buildConfigs).on('event', async (event) => {
    // clear previous onSuccess/onFailure hook processes so they don't pile up
    await killHooks();

    if (event.code === 'START') {
      if (!opts.verbose) {
        clearConsole();
      }
      spinner.start(chalk.bold.cyan('Compiling modules...'));
    }
    if (event.code === 'ERROR') {
      spinner.fail(chalk.bold.red('Failed to compile'));
      logError(event.error);
      failureKiller = run(opts.onFailure);
    }
    if (event.code === 'END') {
      spinner.succeed(chalk.bold.green('Compiled successfully'));
      console.log(`${chalk.dim('Watching for changes')}`);

      try {
        await moveTypes();

        if (firstTime && opts.onFirstSuccess) {
          firstTime = false;
          run(opts.onFirstSuccess);
        } else {
          successKiller = run(opts.onSuccess);
        }
      } catch (_error) {}
    }
  });
};
