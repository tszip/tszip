import { PackageJson } from 'type-fest';
import { Template } from './template';

import basicTemplate from './basic';

const reactTemplate: Template = {
  name: 'react',
  dependencies: [...basicTemplate.dependencies, 'react', 'react-dom'],
  devDependencies: [
    ...basicTemplate.devDependencies,
    '@types/react',
    '@types/react-dom',
  ],
  packageJson: {
    ...basicTemplate.packageJson,
    peerDependencies: {
      react: '>=16',
    },
    scripts: {
      ...basicTemplate.packageJson.scripts,
      test: 'tszip test',
    } as PackageJson['scripts'],
  },
};

export default reactTemplate;
