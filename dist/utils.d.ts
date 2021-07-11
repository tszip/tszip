import { PackageJson } from './types';
export declare const removeScope: (name: string) => string;
export declare const safeVariableName: (name: string) => string;
export declare const safePackageName: (name: string) => string;
/**
 * These packages will not be resolved by Rollup and will be left as imports.
 */
export declare const EXTERNAL_PACKAGES: string[];
/**
 * Mark EXTERNAL_PACKAGES and all relative imports as external.
 */
export declare const external: (id: string) => boolean;
export declare const appDirectory: string;
export declare const resolveApp: (relativePath: string) => string;
export declare function clearConsole(): void;
export declare function getReactVersion({ dependencies, devDependencies, }: PackageJson): string | undefined;
export declare function getNodeEngineRequirement({ engines }: PackageJson): string | undefined;
