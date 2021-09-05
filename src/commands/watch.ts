import chalk from 'chalk';
import type execa from 'execa';
import logError from '../log/error';
import ora from 'ora';

import {
  RollupWatchOptions,
  WatcherOptions,
  watch as rollupWatch,
} from 'rollup';
import { WatchOpts } from '../types';
import { cleanDistFolder } from '../utils/filesystem';
import { clearConsole } from '../utils';
import { createBuildConfigs } from '../configs/createBuildConfigs';
import { moveTypes } from '../deprecated';
import { normalizeOpts } from './build';

const execaProcess = require('execa');

export const watch = async (dirtyOpts: WatchOpts) => {
  const opts = await normalizeOpts(dirtyOpts);
  const buildConfigs = await createBuildConfigs(opts);
  if (!opts.noClean) {
    await cleanDistFolder();
  }

  // await cleanOldJS();

  type Killer = execa.ExecaChildProcess | null;

  let firstTime = true;
  let successKiller: Killer = null;
  let failureKiller: Killer = null;

  function run(command?: string) {
    if (!command) {
      return null;
    }

    const [exec, ...args] = command.split(' ');
    return execaProcess(exec, args, {
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
  rollupWatch(
    (buildConfigs as RollupWatchOptions[]).map((inputOptions) => ({
      watch: {
        silent: true,
        include: ['src/**'],
        exclude: ['node_modules/**'],
      } as WatcherOptions,
      ...inputOptions,
    }))
  ).on('event', async (event) => {
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
      console.log(`
  ${chalk.dim('Watching for changes')}
`);

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
