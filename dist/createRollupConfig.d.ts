import { OutputOptions, RollupOptions } from 'rollup';
import { TsdxOptions } from './types';
export declare function createRollupConfig(opts: TsdxOptions): Promise<RollupOptions & {
    output: OutputOptions;
}>;
