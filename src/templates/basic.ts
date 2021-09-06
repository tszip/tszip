import { Template } from './template';

const basicTemplate: Template = {
  name: 'basic',
  dependencies: ['@tszip/tszip', 'typescript', 'tslib', 'husky'],
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
      dev: 'tszip dev',
      build: 'tszip build',
      test: 'tszip test',
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
