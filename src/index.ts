#!/usr/bin/env node
import { CLIEngine } from 'eslint';
import { build } from './commands/build';
import { create } from './commands/create';
import { createEslintConfig } from './configs/createEslintConfig';
import { getAppPackageJson } from './utils/filesystem';
import { paths } from './constants';
import { templates } from './templates';
import { test } from './commands/test';
import { watch } from './commands/watch';

const sade = require('sade');
const chalk = require('chalk');

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
  .action(watch);

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
  .action(test);

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
