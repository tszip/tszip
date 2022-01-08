/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @see https://github.com/GoogleChromeLabs/proxx/blob/master/lib/simple-ts.js
 * @see https://twitter.com/jaffathecake/status/1145979217852678144
 */

import glob from 'glob-promise';

import { extname, join, relative } from 'path';
import { copy } from 'fs-extra';
import { createProgressEstimator } from '../log/progressEstimator';
import { execa } from 'execa';

const parseArgs = (options: { [key: string]: any }) => {
  const args: string[] = [];
  for (const [key, val] of Object.entries(options)) {
    args.push(`--${key}`, val.toString());
  }

  return args;
};

interface TscArgs {
  tsconfig?: string | null;
  transpileOnly?: boolean;
  watch?: boolean;
}

export async function runTsc({
  tsconfig = null,
  transpileOnly = false,
  watch: _ = false,
}: TscArgs = {}) {
  /**
   * Force src/ rootDir, dist/ outDir, and override noEmit.
   *
   * @todo Leave sourceMaps and declarations in when splitting per-file.
   */
  const args: Record<string, any> = {
    outDir: 'dist/',
    jsx: 'react-jsx',
    module: 'esnext',
    target: 'esnext',
    noEmit: false,
    allowJs: true,
    declaration: true,
    sourceMap: false,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
  };

  const parsedArgs = parseArgs(args);
  if (tsconfig) {
    parsedArgs.push('-p', tsconfig);
  }

  const progressIndicator = await createProgressEstimator();
  await progressIndicator(
    (async () => {
      try {
        /**
         * Must resolve to the local TSC, otherwise it will sometimes resolve to
         * the globally installed typescript package.
         *
         * @see https://github.com/gilamran/tsc-watch/blob/3449aa1c95bd975c22a9ef7b700fac01e777929b/lib/args-manager.js#L59
         */
        const compiler = require.resolve('typescript/bin/tsc', {
          paths: [process.cwd()],
        });
        /**
         * Execute on all src/** files. Do not use srcDir to prevent unexpected
         * behavior, e.g. in a Next project with experimental: { externalDir:
         * true }.
         */
        const execArgs = ['src/**', ...parsedArgs];
        console.log(`$ ${compiler} ${execArgs.join(' ')}`);
        await execa(compiler, parsedArgs);
      } catch (error: any) {
        if (!transpileOnly) {
          console.error(error.toString());
          process.exit(1);
        }
      }
    })(),
    `TS ➡ JS: Compiling with tsc.`
  );

  const srcFiles = await glob('src/**/*', { nodir: true });
  await progressIndicator(
    Promise.all(
      srcFiles
        .filter(
          (file: string) => !/^\.(ts|tsx|js|jsx|json)$/.test(extname(file))
        )
        .map(
          async (file: string) =>
            await copy(file, join('dist', relative('src', file)))
        )
    ),
    'Copying all non-TS and non-JS files to dist/.'
  );

  // if (watch) {
  //   const watchArgs = [...parsedArgs, '--watch', '--preserveWatchOutput'];
  //   console.log('Calling tsc:', watchArgs);
  //   await execa('tsc', watchArgs);
  // }
}
