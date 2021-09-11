import { RollupOptions } from 'rollup';
import { configPath } from '../lib/paths';
import { resolveApp } from '../lib/utils';

export interface TszipConfig {
  rollup?: (config: RollupOptions) => RollupOptions;
}

export const getTszipConfig = async (): Promise<TszipConfig> => {
  try {
    const filePath = resolveApp(configPath);
    const { config } = await import(filePath);
    return config;
  } catch (error) {
    return {};
  }
};
