import { RollupOptions } from 'rollup';
import { ExportTsOptions } from './types';
export declare function createRollupConfig(opts: ExportTsOptions, outputNum: number): Promise<RollupOptions>;
