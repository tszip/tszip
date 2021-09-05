import { RollupOptions } from 'rollup';
import { createConfig } from '@tszip/rollup-config';

export const createRollupConfig = async ({
  input,
  minify,
  watch,
}: {
  input: string;
  minify: boolean;
  watch: boolean;
}): Promise<RollupOptions> => {
  const config = watch
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
