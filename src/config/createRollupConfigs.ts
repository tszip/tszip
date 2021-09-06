import glob from 'fast-glob';

import { createConfig } from '@tszip/rollup-config';
import { extname } from 'path';

export const createBuildConfigs = async ({
  action,
  minify = false,
}: {
  action: 'build' | 'dev';
  minify?: boolean;
}) => {
  const filePattern = /^\.jsx?$/;
  const filesToCheck = './dist/**/*';
  const files = await glob(filesToCheck);
  const filesToOptimize = files.filter(
    (file: string) =>
      /**
       * Do not feed .d.ts to Rollup directly. Only compile files we can consume
       * (JS, TS, CSS).
       */
      !file.endsWith('.d.ts') && filePattern.test(extname(file))
  );

  const configs = filesToOptimize.map((input: string) => {
    return createConfig({
      action,
      input,
      minify,
    });
  });

  return configs;
};
