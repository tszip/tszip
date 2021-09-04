import { PackageJson } from 'type-fest';

export interface Template {
  dependencies: string[];
  name: string;
  packageJson: PackageJson & { husky?: any; prettier?: any };
}
