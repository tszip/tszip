"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildConfigs = void 0;
const tslib_1 = require("tslib");
const createRollupConfig_1 = require("./createRollupConfig");
const glob_promise_1 = tslib_1.__importDefault(require("glob-promise"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
async function createBuildConfigs(opts) {
    /**
     * Generate all forms of the entry points that will be needed.
     */
    const entryPoints = createAllEntryPoints(opts);
    const entryPointConfigs = await Promise.all(entryPoints.map(async (entryPoint) => {
        const packageName = utils_1.safePackageName(opts.name);
        let outputName;
        switch (entryPoint.format) {
            case 'esm':
                outputName = `dist/${packageName}.mjs`;
                break;
            case 'cjs':
                outputName = `dist/${packageName}.cjs`;
                break;
            default:
                outputName = entryPoint.input;
                break;
        }
        const config = await createRollupConfig_1.createRollupConfig(entryPoint);
        config.output.file = outputName;
        return config;
    }));
    const emittedFiles = await glob_promise_1.default('dist/**/*.js');
    /**
     * Make ESM versions of emitted TS output.
     */
    const emittedFilesToESM = emittedFiles.map((input) => ({
        ...opts,
        format: 'esm',
        env: 'production',
        input,
    }));
    /**
     * Make CJS versions of emitted TS output.
     */
    const emittedFilesToCJS = emittedFiles.map((input) => ({
        ...opts,
        format: 'cjs',
        env: 'production',
        input,
    }));
    const emittedFileConfigs = await Promise.all([...emittedFilesToESM, ...emittedFilesToCJS].map(async (options) => {
        const fileExt = options.format === 'esm' ? '.mjs' : '.cjs';
        const config = await createRollupConfig_1.createRollupConfig(options);
        /**
         * Overwrite input files.
         */
        config.output.file = options.input.replace(/\.js$/, fileExt);
        return config;
    }));
    const compilerPasses = [...entryPointConfigs, ...emittedFileConfigs];
    return compilerPasses;
}
exports.createBuildConfigs = createBuildConfigs;
/**
 * Create all the entry points, on a per-format basis, for the library.
 */
function createAllEntryPoints(opts) {
    /**
     * The entry point emitted by TSC.
     */
    const input = `${constants_1.paths.appDist}/index.js`;
    /**
     * Map it to all of the specified output formats (ESM, CJS, UMD, SystemJS,
     * etc.). Only the entry point needs to be specified this way.
     */
    return [
        opts.format.includes('cjs') && {
            ...opts,
            format: 'cjs',
            env: 'development',
            input,
        },
        opts.format.includes('cjs') && {
            ...opts,
            format: 'cjs',
            env: 'production',
            input,
        },
        opts.format.includes('esm') && { ...opts, format: 'esm', input },
        opts.format.includes('umd') && {
            ...opts,
            format: 'umd',
            env: 'development',
            input,
        },
        opts.format.includes('umd') && {
            ...opts,
            format: 'umd',
            env: 'production',
            input,
        },
        opts.format.includes('system') && {
            ...opts,
            format: 'system',
            env: 'development',
            input,
        },
        opts.format.includes('system') && {
            ...opts,
            format: 'system',
            env: 'production',
            input,
        },
    ].filter(Boolean);
}
