import { RollupOptions, OutputOptions } from 'rollup';
import { NormalizedOpts } from './types';
export declare function createBuildConfigs(opts: NormalizedOpts): Promise<(RollupOptions & {
    output: OutputOptions;
})[]>;
