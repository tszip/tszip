import { Template } from './template';

const basicTemplate: Template = {
  name: 'basic',
  dependencies: [],
  devDependencies: [
    'tslib',
    'ts-jest',
    'husky',
    'yarn-deduplicate',
    'typescript',
    '@tszip/tszip',
  ],
  packageJson: {
    /**
     * Force ESM.
     */
    type: 'module',
    version: '0.0.1',
    license: 'MIT',
    /**
     * Only support Node 14+.
     */
    engines: {
      node: '>=14',
    },
    scripts: {
      clean: 'rm -rf dist/',
      preboot: 'yarn clean',
      boot: 'tsc && rollup -c --silent',
      bootstrap: 'yarn boot && yarn build',
      dev: 'tszip dev',
      build: 'tszip build',
      test: 'tszip test',
      'test:watch': 'tszip test --watch',
      'test:coverage': 'tszip test --coverage',
      lint: 'tszip lint',
      prepare: 'tszip build',
    },
    module: './dist/index.js',
    exports: {
      './package.json': './package.json',
      '.': './dist/index.js',
      './*': './dist/*/index.js',
    },
    typings: 'dist/index.d.ts',
    files: ['dist'],
    peerDependencies: {},
    prettier: {
      printWidth: 80,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
    },
  },
};

export default basicTemplate;
