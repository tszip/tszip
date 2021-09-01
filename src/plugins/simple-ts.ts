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

import { spawn } from 'child_process';
import * as ts from 'typescript';
import { createProgressEstimator } from '../createProgressEstimator';

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

export async function runTsc({ transpileOnly = false, watch = false } = {}) {
  /**
   * Force src/ rootDir, dist/ outDir, and override noEmit.
   *
   * @todo Leave sourceMaps and declarations in when splitting per-file.
   */
  const argString = `--rootDir src/ --outDir dist/ --noEmit false --strict ${!transpileOnly}`;
  const args = argString.split(' ');

  console.log(`> Command: tsc ${args.join(' ')}`);
  const progressIndicator = await createProgressEstimator();

  await progressIndicator(
    new Promise((resolve) => {
      const proc = spawn('tsc', args, {
        stdio: 'inherit',
      });

      proc.on('exit', (code) => {
        if (code !== 0) {
          throw Error('TypeScript build failed');
        }
        resolve(void 0);
      });
    }),
    `TS ➡ JS: Compiling with TSC`
  );

  if (watch) {
    spawn('tsc', [...args, '--watch', '--preserveWatchOutput'], {
      stdio: 'inherit',
    });
  }
}

/**
 * This simply runs `tsc` in process.cwd(), reading the TSConfig in that
 * directory, and forcing an emit.
 */
export default function simpleTS() {
  return {
    name: 'simple-ts',
    /**
     * Wait for the process to finish.
     */
    buildStart: async () => await runTsc(),
  };
}
