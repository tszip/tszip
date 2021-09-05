import { RollupOptions } from 'rollup';
import { TszipOptions } from '../types';
import { createConfig } from '@tszip/rollup-config';

export const createRollupConfig = async (
  opts: TszipOptions
): Promise<RollupOptions> => {
  const minify = !opts.transpileOnly && !opts.noMinify;
  const { input } = opts;
  const config =
    opts.env === 'development' || opts.noMinify
      ? createConfig({
          input,
          env: 'dev',
        })
      : createConfig({
          input,
          minify,
          env: 'production',
        });

  return {
    ...config,
    watch: !opts.watch
      ? false
      : {
          include: ['src/**'],
          exclude: ['node_modules/**'],
        },
  };
};
