import jest from 'jest';

import {
  JestConfigOptions,
  createJestConfig,
} from '../configs/createJestConfig';
import { dirname, resolve } from 'path';
import { getAppPackageJson } from '../lib/filesystem';
import { pathExists } from 'fs-extra';
import { paths } from '../lib/constants';
import { resolveApp } from '../lib/utils';

export const test = async (opts: { config?: string }) => {
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
      (relativePath) => resolve(__dirname, '..', relativePath),
      opts.config ? dirname(opts.config) : paths.appRoot
    ),
    ...appPackageJson.jest,
  };

  // Allow overriding with jest.config
  const defaultPathExists = await pathExists(paths.jestConfig);
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
};
