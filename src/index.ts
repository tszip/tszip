#!/usr/bin/env node
// import '@tszip/esm-require';
import sade from 'sade';

import { build } from './commands/build';
import { create } from './commands/create';
import { dev } from './commands/dev';
import { lint } from './commands/lint';
import { templates } from './templates';
import { test } from './commands/test';

const prog = sade('tszip');

prog
  .command('create <pkg>')
  .describe('Create a new package')
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
  .command('dev')
  .describe('Compile package and listen for changes.')
  .action(dev);

prog
  .command('build')
  .describe('Create the release build for the package.')
  .option('--noMinify', 'Do not minify output.')
  .option('--transpileOnly', 'Only transpile TS, do not typecheck.')
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
  .action(lint);

prog.parse(process.argv);
