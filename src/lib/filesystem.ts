import glob from 'glob-promise';
import shell from 'shelljs';

import { extname, resolve, sep } from 'path';
import { readFile, rmdir, stat, unlink } from 'fs/promises';
import { PackageJson } from '../types';
import { createProgressEstimator } from '../configs/createProgressEstimator';
import { paths } from './constants';
import { resolveApp } from './utils';

export const generateImportPattern = (importSource: string) =>
  new RegExp(
    `(from|require\\(|import)\\s*['"]${importSource.replace('.', '\\.')}['"]`,
    'g'
  );

/**
 * Get the package.json for a given absolute entry point.
 */
export const getPackageJson = (absPath: string) => {
  const parts = absPath.split('node_modules');
  const rootPath = parts[0];

  if (parts.length < 2) return null;
  const moduleParts = parts[1].split(sep);

  /**
   * node_modules/name => name
   * node_modules/@test/test => @test/test
   */
  const moduleName = moduleParts[1].startsWith('@')
    ? moduleParts.slice(1, 3).join(sep)
    : moduleParts[1];

  return resolve(rootPath, 'node_modules', moduleName, 'package.json');
};

export const renameExtension = (file: string, dotExtension: string) => {
  const oldExt = extname(file);
  return file.replace(new RegExp(`\\${oldExt}$`), dotExtension);
};

export const cleanOldJS = async () => {
  const progressIndicator = await createProgressEstimator();

  const oldJS = await glob(`${paths.appDist}/**/*.js`);
  // console.log({ oldJS });
  await progressIndicator(
    Promise.all(oldJS.map(async (file: string) => await unlink(file))),
    'Removing original emitted TypeScript output (dist/**/*.js).'
  );
};

export const cleanDistFolder = async () => {
  await rmdir(paths.appDist, { recursive: true });
};

export const isDir = async (name: string) => {
  const stats = await stat(name);
  return stats.isDirectory();
};

export const isFile = async (name: string) => {
  const stats = await stat(name);
  return stats.isFile();
};

export const jsOrTs = async (filename: string) => {
  const extension = (await isFile(resolveApp(filename + '.ts')))
    ? '.ts'
    : (await isFile(resolveApp(filename + '.tsx')))
    ? '.tsx'
    : (await isFile(resolveApp(filename + '.jsx')))
    ? '.jsx'
    : '.js';

  return resolveApp(`${filename}${extension}`);
};

export const getAppPackageJson = async () => {
  try {
    const appPackageJson: PackageJson = JSON.parse(
      await readFile(paths.appPackageJson, 'utf-8')
    );
    return appPackageJson;
  } catch (e) {
    console.log(e);
    throw new Error('No package.json found in project directory.');
  }
};

export const getAuthorName = () => {
  const author = shell
    .exec('git config --global user.name', { silent: true })
    .stdout.trim();

  const email = shell
    .exec('git config --global user.email', { silent: true })
    .stdout.trim();

  return `${author} <${email}>`;
};

export const setAuthorName = (author: string) => {
  shell.exec(`git config --global add user.name "${author}"`, { silent: true });
};
