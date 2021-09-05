#!/usr/bin/env node
import logError from './log/error';

import {
  JestConfigOptions,
  createJestConfig,
} from './configs/createJestConfig';
import { RollupWatchOptions, WatcherOptions, watch } from 'rollup';
import { build, normalizeOpts } from './commands/build';
import { cleanDistFolder, getAppPackageJson } from './utils/filesystem';
import { clearConsole, resolveApp } from './utils';
import { CLIEngine } from 'eslint';
import { WatchOpts } from './types';
import { create } from './commands/create';
import { createBuildConfigs } from './configs/createBuildConfigs';
import { createEslintConfig } from './configs/createEslintConfig';
import { moveTypes } from './deprecated';
import { paths } from './constants';
import { templates } from './templates';

import type execa from 'execa';
import jest from 'jest';

const sade = require('sade');
const chalk = require('chalk');

const path = require('path');
const execaProcess = require('execa');
const ora = require('ora');
const fs = require('fs-extra');
const prog = sade('tszip');

prog
  .command('create <pkg>')
  .describe('Create a new package with ')
  .example('create mypackage')
  .option(
    '--template',
    `Specify a template. Allowed choices: [${Object.keys(templates).join(
      ', '
    )}]`
  )
  .example('create --template react mypackage')
  .action(create);

prog
  .command('watch')
  .describe('Rebuilds on any change')
  .option('--entry, -i', 'Entry module')
  .example('watch --entry src/foo.tsx')
  .option('--target', 'Specify your target environment', 'browser')
  .example('watch --target node')
  .option('--name', 'Specify name exposed in UMD builds')
  .example('watch --name Foo')
  .option('--format', 'Specify module format(s)', 'cjs,esm')
  .example('watch --format cjs,esm')
  .option(
    '--verbose',
    'Keep outdated console output in watch mode instead of clearing the screen'
  )
  .example('watch --verbose')
  .option('--noClean', "Don't clean the dist folder")
  .example('watch --noClean')
  .option('--tsconfig', 'Specify custom tsconfig path')
  .example('watch --tsconfig ./tsconfig.foo.json')
  .option('--onFirstSuccess', 'Run a command on the first successful build')
  .example('watch --onFirstSuccess "echo The first successful build!"')
  .option('--onSuccess', 'Run a command on a successful build')
  .example('watch --onSuccess "echo Successful build!"')
  .option('--onFailure', 'Run a command on a failed build')
  .example('watch --onFailure "The build failed!"')
  .option('--transpileOnly', 'Skip type checking')
  .example('watch --transpileOnly')
  .option('--extractErrors', 'Extract invariant errors to ./errors/codes.json.')
  .example('watch --extractErrors')
  .action(async (dirtyOpts: WatchOpts) => {
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
    watch(
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
  });

prog
  .command('build')
  .describe('Build your project once and exit')
  .option('--entry, -i', 'Entry module')
  .example('build --entry src/foo.tsx')
  .option('--target', 'Specify your target environment', 'browser')
  .example('build --target node')
  .option('--name', 'Specify name exposed in UMD builds')
  .example('build --name Foo')
  .option('--format', 'Specify module format(s)', 'cjs,esm')
  .example('build --format cjs,esm')
  .option('--tsconfig', 'Specify custom tsconfig path')
  .example('build --tsconfig ./tsconfig.foo.json')
  .option('--transpileOnly', 'Skip type checking')
  .example('build --transpileOnly')
  .option(
    '--extractErrors',
    'Extract errors to ./errors/codes.json and provide a url for decoding.'
  )
  .example(
    'build --extractErrors=https://reactjs.org/docs/error-decoder.html?invariant='
  )
  .action(build);

prog
  .command('test')
  .describe('Run jest test runner. Passes through all flags directly to Jest')
  .action(async (opts: { config?: string }) => {
    // Do this as the first thing so that any code reading it knows the right env.
    process.env.BABEL_ENV = 'test';
    process.env.NODE_ENV = 'test';
    // process.env.NODE_OPTIONS = '--experimental-vm-modules npx jest';
    // Makes the script crash on unhandled rejections instead of silently
    // ignoring them. In the future, promise rejections that are not handled will
    // terminate the Node.js process with a non-zero exit code.
    process.on('unhandledRejection', (err) => {
      throw err;
    });

    const appPackageJson = await getAppPackageJson();

    const argv = process.argv.slice(2);
    let jestConfig: JestConfigOptions = {
      ...createJestConfig(
        (relativePath) => path.resolve(__dirname, '..', relativePath),
        opts.config ? path.dirname(opts.config) : paths.appRoot
      ),
      ...appPackageJson.jest,
    };

    // Allow overriding with jest.config
    const defaultPathExists = await fs.pathExists(paths.jestConfig);
    if (opts.config || defaultPathExists) {
      const jestConfigPath = resolveApp(opts.config || paths.jestConfig);
      const jestModule = await import(jestConfigPath);
      const jestConfigContents: JestConfigOptions = jestModule.default;
      jestConfig = { ...jestConfig, ...jestConfigContents };
    }

    // if custom path, delete the arg as it's already been merged
    if (opts.config) {
      let configIndex = argv.indexOf('--config');
      if (configIndex !== -1) {
        // case of "--config path", delete both args
        argv.splice(configIndex, 2);
      } else {
        // case of "--config=path", only one arg to delete
        const configRegex = /--config=.+/;
        configIndex = argv.findIndex((arg) => arg.match(configRegex));
        if (configIndex !== -1) {
          argv.splice(configIndex, 1);
        }
      }
    }

    argv.push(
      '--config',
      JSON.stringify({
        ...jestConfig,
      })
    );

    const [, ...argsToPassToJestCli] = argv;
    jest.run(argsToPassToJestCli);
  });

prog
  .command('lint')
  .describe('Run eslint with Prettier')
  .example('lint src test')
  .option('--fix', 'Fixes fixable errors and warnings')
  .example('lint src test --fix')
  .option('--ignore-pattern', 'Ignore a pattern')
  .example('lint src test --ignore-pattern test/foobar.ts')
  .option(
    '--max-warnings',
    'Exits with non-zero error code if number of warnings exceed this number',
    Infinity
  )
  .example('lint src test --max-warnings 10')
  .option('--write-file', 'Write the config file locally')
  .example('lint --write-file')
  .option('--report-file', 'Write JSON report to file locally')
  .example('lint --report-file eslint-report.json')
  .action(
    async (opts: {
      fix: boolean;
      'ignore-pattern': string;
      'write-file': boolean;
      'report-file': string;
      'max-warnings': number;
      _: string[];
    }) => {
      if (opts['_'].length === 0 && !opts['write-file']) {
        const defaultInputs = ['src', 'test'].filter(fs.existsSync);
        opts['_'] = defaultInputs;
        console.log(
          chalk.yellow(
            `Defaulting to "tszip lint ${defaultInputs.join(' ')}"`,
            '\nYou can override this in the package.json scripts, like "lint": "tszip lint src otherDir"'
          )
        );
      }

      const appPackageJson = await getAppPackageJson();

      const config = await createEslintConfig({
        pkg: appPackageJson,
        rootDir: paths.appRoot,
        writeFile: opts['write-file'],
      });

      const cli = new CLIEngine({
        baseConfig: {
          ...config,
          ...appPackageJson.eslint,
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fix: opts.fix,
        ignorePattern: opts['ignore-pattern'],
      });
      const report = cli.executeOnFiles(opts['_']);
      if (opts.fix) {
        CLIEngine.outputFixes(report);
      }
      console.log(cli.getFormatter()(report.results));
      if (opts['report-file']) {
        await fs.outputFile(
          opts['report-file'],
          cli.getFormatter('json')(report.results)
        );
      }
      if (report.errorCount) {
        process.exit(1);
      }
      if (report.warningCount > opts['max-warnings']) {
        process.exit(1);
      }
    }
  );

prog.parse(process.argv);
