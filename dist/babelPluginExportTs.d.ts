/**
 * @todo Do not use require.resolve so that the package can ship as ESM.
 */
export declare const isTruthy: (obj?: any) => boolean;
export declare const mergeConfigItems: (type: any, ...configItemsToMerge: any[]) => any[];
export declare const createConfigItems: (type: any, items: any[]) => any[][];
export declare const babelPluginExportTs: typeof import("@rollup/plugin-babel").getBabelInputPlugin;
