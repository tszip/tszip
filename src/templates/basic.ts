import { Template } from './template';

const basicTemplate: Template = {
  name: 'basic',
  dependencies: [
    'husky',
    'export-ts',
    'tslib',
    'typescript',
    'size-limit',
    '@size-limit/preset-small-lib',
  ],
  packageJson: {
    // name: safeName,
    version: '0.1.0',
    license: 'MIT',
    // author: author,
    main: './dist/index.cjs',
    module: './dist/index.mjs',
    exports: {
      './package.json': './package.json',
      '.': {
        import: './dist/index.mjs',
        require: './dist/index.cjs',
      },
    },
    // module: `dist/${safeName}.mjs`,
    typings: `dist/index.d.ts`,
    files: ['dist', 'src'],
    engines: {
      node: '>=14',
    },
    scripts: {
      start: 'export-ts watch',
      build: 'export-ts build',
      test: 'export-ts test',
      posttest: 'node test/import.mjs && node test/require.cjs',
      lint: 'export-ts lint',
      prepare: 'export-ts build',
      size: 'size-limit',
      analyze: 'size-limit --why',
    },
    peerDependencies: {},
    husky: {
      hooks: {
        'pre-commit': 'export-ts lint',
      },
    },
    prettier: {
      printWidth: 80,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
    },
  },
};

export default basicTemplate;
