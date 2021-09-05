import { CLIEngine } from 'eslint';
import { PackageJson } from '../types';

import fs from 'fs-extra';
// import { getReactVersion } from './utils';

const path = require('path');
interface CreateEslintConfigArgs {
  pkg: PackageJson;
  rootDir: string;
  writeFile: boolean;
}

const CONFIG = {
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  extends: [
    'react-app',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    'sort-imports': ['error', { allowSeparatedGroups: true }],
  },
};

export async function createEslintConfig({
  pkg: _,
  rootDir,
  writeFile,
}: CreateEslintConfigArgs): Promise<CLIEngine.Options['baseConfig'] | void> {
  if (!writeFile) {
    return CONFIG;
  }

  const file = path.join(rootDir, '.eslintrc');
  try {
    await fs.writeFile(file, JSON.stringify(CONFIG, null, 2), { flag: 'wx' });
  } catch (e: any) {
    if (e.code === 'EEXIST') {
      console.error(
        'Error trying to save the Eslint configuration file:',
        `${file} already exists.`
      );
    } else {
      console.error(e);
    }

    return CONFIG;
  }
}
