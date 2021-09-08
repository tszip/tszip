import { Config } from '@jest/types';
// import tsJest from 'ts-jest';

export type JestConfigOptions = Partial<Config.InitialOptions>;

export async function createJestConfig(
  rootDir: string
): Promise<JestConfigOptions> {
  const config: JestConfigOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {},
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
    roots: ['<rootDir>/test'],
    testURL: 'http://localhost',
    rootDir,
    watchPlugins: [
      require.resolve('jest-watch-typeahead/filename'),
      require.resolve('jest-watch-typeahead/testname'),
    ],
  };

  return config;
}
