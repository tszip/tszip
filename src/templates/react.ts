import { PackageJson } from 'type-fest';
import { Template } from './template';

import basicTemplate from './basic';

const reactTemplate: Template = {
  name: 'react',
  dependencies: [
    ...basicTemplate.dependencies,
    '@types/react',
    '@types/react-dom',
    'react',
    'react-dom',
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
