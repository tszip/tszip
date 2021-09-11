import { resolveApp } from './utils';

export const packageJsonPath = resolveApp('package.json');
export const tsconfigPath = resolveApp('tsconfig.json');
export const testsSetupPath = resolveApp('test/setupTests.ts');
export const rootPath = resolveApp('.');
export const srcPath = resolveApp('src');
export const errorCodesPath = resolveApp('errors/codes.json');
export const errorsPath = resolveApp('errors');
export const distPath = resolveApp('dist');
export const configPath = resolveApp('tszip.config.js');
export const jestConfigPath = resolveApp('jest.config.js');
export const progressEstimatorCachePath = resolveApp(
  'node_modules/.cache/.progress-estimator'
);
