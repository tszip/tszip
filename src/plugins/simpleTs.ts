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

// import { spawn } from 'child_process';
import { copy } from 'fs-extra';
import { basename, extname, join } from 'path';
import * as ts from 'typescript';
import { createProgressEstimator } from '../configs/createProgressEstimator';

const glob = require('glob-promise');
const execa = require('execa');
// const extRe = /\.tsx?$/;

export function loadConfig() {
  const fileName = ts.findConfigFile('.', ts.sys.fileExists);
  if (!fileName) throw Error('tsconfig not found');
  const text = ts.sys.readFile(fileName) ?? '';
  const loadedConfig = ts.parseConfigFileTextToJson(fileName, text).config;
  const parsedTsConfig = ts.parseJsonConfigFileContent(
    loadedConfig,
    ts.sys,
    process.cwd(),
    undefined,
    fileName
  );
  return parsedTsConfig;
}

export function resolveId(id: string, importer = '') {
  const config = loadConfig();

  // If there isn't an importer, it's an entry point, so we don't need to resolve it relative
  // to something.
  if (!importer) return null;

  const tsResolve = ts.resolveModuleName(id, importer, config.options, ts.sys);

  if (
    // It didn't find anything
    !tsResolve.resolvedModule ||
    // Or if it's linking to a definition file, it's something in node_modules,
    // or something local like css.d.ts
    tsResolve.resolvedModule.extension === '.d.ts'
  ) {
    return null;
  }

  return tsResolve.resolvedModule.resolvedFileName;
}

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
  watch = false,
}: TscArgs = {}) {
  /**
   * Force src/ rootDir, dist/ outDir, and override noEmit.
   *
   * @todo Leave sourceMaps and declarations in when splitting per-file.
   */
  const args: Record<string, any> = {
    rootDir: 'src/',
    outDir: 'dist/',
    jsx: 'react-jsx',
    module: 'esnext',
    target: 'esnext',
    noEmit: false,
    allowJs: true,
    declaration: true,
    sourceMap: true,
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
        await execa('tsc', parsedArgs);
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
          async (file: string) => await copy(file, join('dist', basename(file)))
        )
    ),
    'Copying all non-TS and non-JS files to dist/.'
  );

  if (watch) {
    await execa('tsc', [...parsedArgs, '--watch', '--preserveWatchOutput']);
  }
}

/**
 * This simply runs `tsc` in process.cwd(), reading the TSConfig in that
 * directory, and forcing an emit.
 */
export default function simpleTS(...args: any[]) {
  return {
    name: 'simple-ts',
    /**
     * Wait for the process to finish.
     */
    buildStart: async () => await runTsc(...args),
  };
}
