import { CLIEngine } from 'eslint';
import { PackageJson } from './types';
interface CreateEslintConfigArgs {
    pkg: PackageJson;
    rootDir: string;
    writeFile: boolean;
}
export declare function createEslintConfig({ pkg, rootDir, writeFile, }: CreateEslintConfigArgs): Promise<CLIEngine.Options['baseConfig'] | void>;
export {};
