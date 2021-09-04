import { Template } from './template';

const basicTemplate: Template = {
  name: 'basic',
  dependencies: ['@tszip/tszip', 'typescript', 'tslib', 'husky'],

  // @todo Update for ESM
  packageJson: {
    type: 'module',
    version: '0.0.1',
    license: 'MIT',
    engines: {
      node: '>=14',
    },
    scripts: {
      start: 'tszip watch',
      build: 'tszip build',
      test: 'tszip test',
      posttest: 'node test/import.js',
      lint: 'tszip lint',
      prepare: 'tszip build',
      // size: 'size-limit',
      // analyze: 'size-limit --why',
    },
    module: './dist/index.js',
    exports: {
      './package.json': './package.json',
      '.': './dist/index.js',
      './*': './dist/*.js',
    },
    typings: `dist/index.d.ts`,
    files: ['dist', 'src'],
    peerDependencies: {},
    // @todo Re-add Husky.
    // husky: {
    //   hooks: {
    //     'pre-commit': 'tszip lint',
    //   },
    // },
    prettier: {
      printWidth: 80,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
    },
  },
};

export default basicTemplate;
