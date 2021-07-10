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
export default function simpleTS(mainPath = '.', { noBuild = false, watch = false } = {}) {
    const args = ['-b', mainPath];
    let done = Promise.resolve();
    if (!noBuild) {
        done = new Promise((resolve) => {
            const proc = spawn('tsc', args, {
                stdio: 'inherit',
            });
            proc.on('exit', (code) => {
                if (code !== 0) {
                    throw Error('TypeScript build failed');
                }
                resolve();
            });
        });
    }
    if (!noBuild && watch) {
        done.then(() => {
            spawn('tsc', [...args, '--watch', '--preserveWatchOutput'], {
                stdio: 'inherit',
            });
        });
    }
    return {
        name: 'simple-ts',
        buildStart: async () => await done,
    };
}
//# sourceMappingURL=simple-ts.js.map