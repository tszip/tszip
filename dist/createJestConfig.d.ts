import { Config } from '@jest/types';
export declare type JestConfigOptions = Partial<Config.InitialOptions>;
export declare function createJestConfig(_: (relativePath: string) => void, rootDir: string): JestConfigOptions;
