import { RollupOptions } from 'rollup';
import { TszipOptions } from '../types';
import { createConfig } from '@tszip/rollup-config';

export const createRollupConfig = async (
  opts: TszipOptions
): Promise<RollupOptions> => {
  const { input } = opts;
  const minify = !opts.transpileOnly && !opts.noMinify;
  const config = opts.watch
    ? createConfig({
        input,
        minify: false,
        // env: 'dev',
        action: 'watch',
      })
    : createConfig({
        input,
        minify,
        // env: 'dev',
        action: 'build',
      });

  return config;
};
