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
import * as ts from 'typescript';
export declare function loadConfig(): ts.ParsedCommandLine;
export declare function resolveId(id: string, importer?: string): string | null;
export declare function runTsc({ noBuild, watch }?: {
    noBuild?: boolean | undefined;
    watch?: boolean | undefined;
}): Promise<void>;
/**
 * This simply runs `tsc` in process.cwd(), reading the TSConfig in that
 * directory, and forcing an emit.
 */
export default function simpleTS(): {
    name: string;
    /**
     * Wait for the process to finish.
     */
    buildStart: () => Promise<void>;
};
