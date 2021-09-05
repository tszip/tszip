import { ModuleFormat, NormalizedOpts, WatchOpts } from '../types';
import { RollupOptions, rollup } from 'rollup';
import {
  cleanDistFolder,
  getAppPackageJson,
  isDir,
  jsOrTs,
} from '../utils/filesystem';
import { createBuildConfigs } from '../configs/createBuildConfigs';
import { createProgressEstimator } from '../configs/createProgressEstimator';
import logError from '../log/error';
import { resolveApp } from '../utils';
import { runTsc } from '../plugins/simpleTs';

const glob = require('glob-promise');

async function getInputs(
  entries?: string | string[],
  source?: string
): Promise<string[]> {
  let entryList = [];
  if (entries) {
    if (!Array.isArray(entries)) {
      entryList.push(entries);
    } else {
      entryList.push(...entries);
    }
  } else {
    if (source) {
      const appDir = resolveApp(source);
      entryList.push(appDir);
    } else {
      const srcExists = await isDir(resolveApp('src'));
      if (srcExists) {
        const entryPoint = await jsOrTs('src/index');
        entryList.push(entryPoint);
      }
    }
  }

  const inputPromises = entryList.map(async (file) => await glob(file));
  const inputs = await Promise.all(inputPromises);
  return inputs.flat();
}

export const normalizeOpts = async (
  opts: WatchOpts
): Promise<NormalizedOpts> => {
  const appPackageJson = await getAppPackageJson();
  return {
    ...opts,
    name: opts.name || appPackageJson.name,
    input: await getInputs(opts.entry, appPackageJson.source),
    format: opts.format.split(',').map((format: string) => {
      if (format === 'es') {
        return 'esm';
      }
      return format;
    }) as [ModuleFormat, ...ModuleFormat[]],
  };
};

export const build = async (dirtyOpts: WatchOpts) => {
  const opts = await normalizeOpts(dirtyOpts);
  const progressIndicator = await createProgressEstimator();

  await progressIndicator(cleanDistFolder(), 'Cleaning dist/.');
  await runTsc({
    tsconfig: opts.tsconfig,
    transpileOnly: opts.transpileOnly,
  });

  const buildConfigs = await createBuildConfigs(opts);

  try {
    await progressIndicator(
      Promise.all(
        buildConfigs.map(async (buildConfig) => {
          if (buildConfig.output) {
            const outputs: RollupOptions[] = Array.isArray(buildConfig.output)
              ? buildConfig.output
              : [buildConfig.output];

            return await Promise.all(
              outputs.map(async (output) => {
                const bundle = await rollup(buildConfig);
                return await bundle.write(output);
              })
            );
          }
          return null;
        })
      ),
      'JS ➡ JS: Resolving imports and minifying.'
    );
    /**
     * Remove old index.js.
     */
    // await cleanOldJS();
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};
