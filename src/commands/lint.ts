import chalk from 'chalk';

import { CLIEngine } from 'eslint';
import { createEslintConfig } from '../config/eslint';
import { existsSync } from 'fs';
import { getAppPackageJson } from '../lib/filesystem';
import { rootPath } from '../lib/paths';
import { writeFile } from 'fs/promises';

export const lint = async (opts: {
  fix: boolean;
  'ignore-pattern': string;
  'write-file': boolean;
  'report-file': string;
  'max-warnings': number;
  _: string[];
}) => {
  if (opts['_'].length === 0 && !opts['write-file']) {
    const defaultInputs = ['src', 'test'].filter(existsSync);
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
    rootDir: rootPath,
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
    await writeFile(
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
};
