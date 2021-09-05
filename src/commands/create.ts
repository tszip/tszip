import Input from 'enquirer/lib/prompts/input.js';
import Select from 'enquirer/lib/prompts/select.js';

import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import logError from '../log/error';
import ora from 'ora';
import semver from 'semver';

import { getAuthorName, setAuthorName } from '../utils/filesystem';
import { getInstallArgs, getInstallCmd } from '../utils/installDeps';
import { getNodeEngineRequirement, safePackageName } from '../utils';
import { incorrectNodeVersion, installing, start } from '../log/messages';

import { TszipOptions } from '../types';
import { composePackageJson } from '../templates/utils';
import { indentLog } from '../log';
import { templates } from '../templates';

import { fileURLToPath } from 'url';
import { resolve } from 'path';

export const create = async (pkg: string, opts: TszipOptions) => {
  console.log();
  indentLog(chalk.bgBlue(`tszip`), 2);
  console.log();

  pkg = safePackageName(pkg);

  const bootSpinner = ora(`Creating ${chalk.bold.green(pkg)}...`);
  let template: any;
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
    const rootPath = fileURLToPath(import.meta.url);
    const templateDir = resolve(rootPath, `../../../templates/${template}`);
    await fs.copy(templateDir, projectPath, {
      overwrite: true,
    });
    // fix gitignore
    await fs.move(
      resolve(projectPath, './gitignore'),
      resolve(projectPath, './.gitignore')
    );

    // update license year and author
    let license: string = await fs.readFile(resolve(projectPath, 'LICENSE'), {
      encoding: 'utf-8',
    });

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

    await fs.writeFile(resolve(projectPath, 'LICENSE'), license, {
      encoding: 'utf-8',
    });

    const templateConfig = templates[template as keyof typeof templates];
    const generatePackageJson = composePackageJson(templateConfig);

    // Install deps
    process.chdir(projectPath);
    const safeName = safePackageName(pkg);
    const pkgJson = generatePackageJson({ name: safeName, author });

    const nodeVersionReq = getNodeEngineRequirement(pkgJson);
    if (nodeVersionReq && !semver.satisfies(process.version, nodeVersionReq)) {
      bootSpinner.fail(incorrectNodeVersion(nodeVersionReq));
      process.exit(1);
    }

    await fs.outputJSON(resolve(projectPath, 'package.json'), pkgJson);
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
    await execa(cmd, getInstallArgs(cmd, deps));
    installSpinner.succeed('Installed dependencies');

    indentLog('Initializing git repo.');
    await execa('git', ['init']);

    console.log(await start(pkg));
  } catch (error) {
    installSpinner.fail('Failed to install dependencies');
    logError(error);
    process.exit(1);
  }
};
