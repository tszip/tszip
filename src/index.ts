#!/usr/bin/env node
// import * as sade from 'sade';
// import * as glob from 'glob-promise';
// import * as chalk from 'chalk';
// import * as jest from 'jest';
// import * as path from 'path';
// import * as execa from 'execa';
// import * as shell from 'shelljs';
// import * as ora from 'ora';
// import * as semver from 'semver';
// import * as Messages from './messages';
// import * as deprecated from './deprecated';
// import * as fs from 'fs-extra';

import getInstallCmd from './getInstallCmd';
import getInstallArgs from './getInstallArgs';
import Input from 'enquirer/lib/prompts/input.js';
import Select from 'enquirer/lib/prompts/select.js';
import logError from './logError';

import { rollup, watch, RollupWatchOptions, WatcherOptions } from 'rollup';
import { CLIEngine } from 'eslint';
import { paths } from './constants';
import { createBuildConfigs } from './createBuildConfigs';
import { createJestConfig, JestConfigOptions } from './createJestConfig';
import { createEslintConfig } from './createEslintConfig';
import {
  resolveApp,
  safePackageName,
  clearConsole,
  getNodeEngineRequirement,
} from './utils';

import {
  PackageJson,
  WatchOpts,
  BuildOpts,
  ModuleFormat,
  NormalizedOpts,
  TszipOptions,
} from './types';

import { createProgressEstimator } from './createProgressEstimator';
import { templates } from './templates';
import { composePackageJson } from './templates/utils';
import { readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { indentLog } from './utils/log';
import { runTsc } from './plugins/simple-ts';

import type execa from 'execa';
import shell from 'shelljs';
import { incorrectNodeVersion, installing, start } from './messages';
import { moveTypes } from './deprecated';

const sade = require('sade');
const glob = require('glob-promise');
const chalk = require('chalk');
const jest = require('jest');
const path = require('path');
const execaProcess = require('execa');
// const shell = require('shelljs');
const ora = require('ora');
const semver = require('semver');
const fs = require('fs-extra');

export * from './errors';

const prog = sade('tszip');

let appPackageJson: PackageJson;
try {
  appPackageJson = JSON.parse(readFileSync(paths.appPackageJson, 'utf-8'));
} catch (e) {}

export const isDir = (name: string) =>
  stat(name)
    .then((stats) => stats.isDirectory())
    .catch(() => false);

export const isFile = (name: string) =>
  stat(name)
    .then((stats) => stats.isFile())
    .catch(() => false);

async function jsOrTs(filename: string) {
  const extension = (await isFile(resolveApp(filename + '.ts')))
    ? '.ts'
    : (await isFile(resolveApp(filename + '.tsx')))
    ? '.tsx'
    : (await isFile(resolveApp(filename + '.jsx')))
    ? '.jsx'
    : '.js';

  return resolveApp(`${filename}${extension}`);
}

async function getInputs(
  entries?: string | string[],
  source?: string
): Promise<string[]> {
  let entryList = [];
  if (entries) {
    if (!Array.isArray(entries)) {
      entryList.push(entries);
    } else {
      entryList.push(...entries);
    }
  } else {
    if (source) {
      const appDir = resolveApp(source);
      entryList.push(appDir);
    } else {
      const srcExists = await isDir(resolveApp('src'));
      if (srcExists) {
        const entryPoint = await jsOrTs('src/index');
        entryList.push(entryPoint);
      }
    }
  }

  const inputPromises = entryList.map(async (file) => await glob(file));
  const inputs = await Promise.all(inputPromises);
  return inputs.flat();
}

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
  .action(async (pkg: string, opts: TszipOptions) => {
    console.log();
    indentLog(chalk.bgBlue(`tszip`), 2);
    console.log();

    const bootSpinner = ora(`Creating ${chalk.bold.green(pkg)}...`);
    let template;
    // Helper fn to prompt the user for a different
    // folder name if one already exists
    async function getProjectPath(projectPath: string): Promise<string> {
      const exists = await fs.pathExists(projectPath);
      if (!exists) {
        return projectPath;
      }

      bootSpinner.fail(`Failed to create ${chalk.bold.red(pkg)}`);
      const prompt = new Input({
        message: `A folder named ${chalk.bold.red(
          pkg
        )} already exists! ${chalk.bold('Choose a different name')}`,
        initial: pkg + '-1',
        result: (v: string) => v.trim(),
      });

      pkg = await prompt.run();

      const realPath = await fs.realpath(process.cwd());
      projectPath = realPath + '/' + pkg;

      bootSpinner.start(`Creating ${chalk.bold.green(pkg)}...`);
      return await getProjectPath(projectPath); // recursion!
    }

    try {
      // get the project path
      const realPath = await fs.realpath(process.cwd());
      let projectPath = await getProjectPath(realPath + '/' + pkg);

      const prompt = new Select({
        message: 'Choose a template',
        choices: Object.keys(templates),
      });

      if (opts.template) {
        template = opts.template.trim();
        if (!prompt.choices.includes(template)) {
          bootSpinner.fail(`Invalid template ${chalk.bold.red(template)}`);
          template = await prompt.run();
        }
      } else {
        template = await prompt.run();
      }

      bootSpinner.start();
      // copy the template
      await fs.copy(
        path.resolve(__dirname, `../templates/${template}`),
        projectPath,
        {
          overwrite: true,
        }
      );
      // fix gitignore
      await fs.move(
        path.resolve(projectPath, './gitignore'),
        path.resolve(projectPath, './.gitignore')
      );

      // update license year and author
      let license: string = await fs.readFile(
        path.resolve(projectPath, 'LICENSE'),
        { encoding: 'utf-8' }
      );

      license = license.replace(/<year>/, `${new Date().getFullYear()}`);

      // attempt to automatically derive author name
      let author = getAuthorName();

      if (!author) {
        bootSpinner.stop();
        const licenseInput = new Input({
          name: 'author',
          message: 'Who is the package author?',
        });
        author = await licenseInput.run();
        setAuthorName(author);
        bootSpinner.start();
      }

      license = license.replace(/<author>/, author.trim());

      await fs.writeFile(path.resolve(projectPath, 'LICENSE'), license, {
        encoding: 'utf-8',
      });

      const templateConfig = templates[template as keyof typeof templates];
      const generatePackageJson = composePackageJson(templateConfig);

      // Install deps
      process.chdir(projectPath);
      const safeName = safePackageName(pkg);
      const pkgJson = generatePackageJson({ name: safeName, author });

      const nodeVersionReq = getNodeEngineRequirement(pkgJson);
      if (
        nodeVersionReq &&
        !semver.satisfies(process.version, nodeVersionReq)
      ) {
        bootSpinner.fail(incorrectNodeVersion(nodeVersionReq));
        process.exit(1);
      }

      await fs.outputJSON(path.resolve(projectPath, 'package.json'), pkgJson);
      bootSpinner.succeed(`Created ${chalk.bold.green(pkg)}`);
      await start(pkg);
    } catch (error) {
      bootSpinner.fail(`Failed to create ${chalk.bold.red(pkg)}`);
      logError(error);
      process.exit(1);
    }

    const templateConfig = templates[template as keyof typeof templates];
    const { dependencies: deps } = templateConfig;

    const installSpinner = ora(installing(deps.sort())).start();
    try {
      const cmd = await getInstallCmd();
      await execaProcess(cmd, getInstallArgs(cmd, deps));
      installSpinner.succeed('Installed dependencies');

      indentLog('Initializing git repo.');
      await execaProcess('git', ['init']);

      console.log(await start(pkg));
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      logError(error);
      process.exit(1);
    }
  });

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

    await cleanOldJS();

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
  .action(async (dirtyOpts: BuildOpts) => {
    const opts = await normalizeOpts(dirtyOpts);
    const progressIndicator = await createProgressEstimator();

    await progressIndicator(cleanDistFolder(), 'Cleaning dist/.');
    await runTsc({
      tsconfig: opts.tsconfig,
      transpileOnly: opts.transpileOnly,
    });

    const buildConfigs = await createBuildConfigs(opts);

    try {
      await progressIndicator(
        Promise.all(
          buildConfigs.map(async (buildConfig) => {
            const bundle = await rollup(buildConfig);
            await bundle.write(buildConfig.output);
          })
        ),
        'JS ➡ JS: Optimizing JS entry-points.'
      );
      /**
       * Remove old index.js.
       */
      await cleanOldJS();
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  });

async function normalizeOpts(opts: WatchOpts): Promise<NormalizedOpts> {
  return {
    ...opts,
    name: opts.name || appPackageJson.name,
    input: await getInputs(opts.entry, appPackageJson.source),
    format: opts.format.split(',').map((format: string) => {
      if (format === 'es') {
        return 'esm';
      }
      return format;
    }) as [ModuleFormat, ...ModuleFormat[]],
  };
}

async function cleanOldJS() {
  const progressIndicator = await createProgressEstimator();

  const oldJS = await glob(`${paths.appDist}/**/*.js`);
  // console.log({ oldJS });
  await progressIndicator(
    Promise.all(oldJS.map(async (file: string) => await fs.unlink(file))),
    'Removing original emitted TypeScript output (dist/**/*.js).'
  );
}

async function cleanDistFolder() {
  await fs.remove(paths.appDist);
}

function getAuthorName() {
  let author = '';

  author = shell
    .exec('npm config get init-author-name', { silent: true })
    .stdout.trim();
  if (author) return author;

  author = shell
    .exec('git config --global user.name', { silent: true })
    .stdout.trim();
  if (author) {
    setAuthorName(author);
    return author;
  }

  author = shell
    .exec('npm config get init-author-email', { silent: true })
    .stdout.trim();
  if (author) return author;

  author = shell
    .exec('git config --global user.email', { silent: true })
    .stdout.trim();
  if (author) return author;

  return author;
}

function setAuthorName(author: string) {
  shell.exec(`npm config set init-author-name "${author}"`, { silent: true });
}

prog
  .command('test')
  .describe('Run jest test runner. Passes through all flags directly to Jest')
  .action(async (opts: { config?: string }) => {
    // Do this as the first thing so that any code reading it knows the right env.
    process.env.BABEL_ENV = 'test';
    process.env.NODE_ENV = 'test';
    // Makes the script crash on unhandled rejections instead of silently
    // ignoring them. In the future, promise rejections that are not handled will
    // terminate the Node.js process with a non-zero exit code.
    process.on('unhandledRejection', (err) => {
      throw err;
    });

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
      const jestConfigContents: JestConfigOptions = require(jestConfigPath);
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
