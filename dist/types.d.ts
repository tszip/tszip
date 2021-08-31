interface SharedOpts {
    target: 'node' | 'browser';
    tsconfig?: string;
    extractErrors?: boolean;
}
export declare type ModuleFormat = 'cjs' | 'umd' | 'esm' | 'system';
export interface BuildOpts extends SharedOpts {
    name?: string;
    entry?: string | string[];
    format: 'cjs,esm';
    target: 'browser';
}
export interface WatchOpts extends BuildOpts {
    verbose?: boolean;
    noClean?: boolean;
    onFirstSuccess?: string;
    onSuccess?: string;
    onFailure?: string;
}
export interface NormalizedOpts extends Omit<WatchOpts, 'name' | 'input' | 'format'> {
    name: string;
    input: string[];
    format: [ModuleFormat, ...ModuleFormat[]];
}
export interface ExportTsOptions extends SharedOpts {
    name: string;
    input: string;
    env: 'development' | 'production';
    format: ModuleFormat;
    /** If `true`, Babel transpile and emit ES5. */
    legacy: boolean;
    minify?: boolean;
    writeMeta?: boolean;
    transpileOnly?: boolean;
}
export interface PackageJson {
    name: string;
    source?: string;
    jest?: any;
    eslint?: any;
    dependencies?: {
        [packageName: string]: string;
    };
    devDependencies?: {
        [packageName: string]: string;
    };
    engines?: {
        node?: string;
    };
}
export {};
