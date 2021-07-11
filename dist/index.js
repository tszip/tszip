#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFile = exports.isDir = void 0;
const tslib_1 = require("tslib");
const sade_1 = tslib_1.__importDefault(require("sade"));
const glob_promise_1 = tslib_1.__importDefault(require("glob-promise"));
const rollup_1 = require("rollup");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const jest_1 = tslib_1.__importDefault(require("jest"));
const eslint_1 = require("eslint");
const logError_1 = tslib_1.__importDefault(require("./logError"));
const path_1 = tslib_1.__importDefault(require("path"));
const execa_1 = tslib_1.__importDefault(require("execa"));
const shelljs_1 = tslib_1.__importDefault(require("shelljs"));
const ora_1 = tslib_1.__importDefault(require("ora"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const constants_1 = require("./constants");
const Messages = tslib_1.__importStar(require("./messages"));
const createBuildConfigs_1 = require("./createBuildConfigs");
const createJestConfig_1 = require("./createJestConfig");
const createEslintConfig_1 = require("./createEslintConfig");
const utils_1 = require("./utils");
const jpjs_1 = require("jpjs");
const getInstallCmd_1 = tslib_1.__importDefault(require("./getInstallCmd"));
const getInstallArgs_1 = tslib_1.__importDefault(require("./getInstallArgs"));
const input_js_1 = tslib_1.__importDefault(require("enquirer/lib/prompts/input.js"));
const select_js_1 = tslib_1.__importDefault(require("enquirer/lib/prompts/select.js"));
const createProgressEstimator_1 = require("./createProgressEstimator");
const templates_1 = require("./templates");
const utils_2 = require("./templates/utils");
const deprecated = tslib_1.__importStar(require("./deprecated"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const simple_ts_1 = require("./plugins/simple-ts");
tslib_1.__exportStar(require("./errors"), exports);
const prog = sade_1.default('tsdx');
let appPackageJson;
try {
    appPackageJson = JSON.parse(fs_1.readFileSync(constants_1.paths.appPackageJson, 'utf-8'));
}
catch (e) {
    throw new Error(`Couldn't read app package.json: ${e}`);
}
const isDir = (name) => promises_1.stat(name)
    .then((stats) => stats.isDirectory())
    .catch(() => false);
exports.isDir = isDir;
const isFile = (name) => promises_1.stat(name)
    .then((stats) => stats.isFile())
    .catch(() => false);
exports.isFile = isFile;
async function jsOrTs(filename) {
    const extension = (await exports.isFile(utils_1.resolveApp(filename + '.ts')))
        ? '.ts'
        : (await exports.isFile(utils_1.resolveApp(filename + '.tsx')))
            ? '.tsx'
            : (await exports.isFile(utils_1.resolveApp(filename + '.jsx')))
                ? '.jsx'
                : '.js';
    return utils_1.resolveApp(`${filename}${extension}`);
}
async function getInputs(entries, source) {
    const results = []
        .concat(entries && entries.length
        ? entries
        : (source && utils_1.resolveApp(source)) ||
            ((await exports.isDir(utils_1.resolveApp('src'))) && (await jsOrTs('src/index'))))
        .map(async (file) => await glob_promise_1.default(file));
    return jpjs_1.concatAllArray(await Promise.all(results));
}
prog
    .command('create <pkg>')
    .describe('Create a new package with TSDX')
    .example('create mypackage')
    .option('--template', `Specify a template. Allowed choices: [${Object.keys(templates_1.templates).join(', ')}]`)
    .example('create --template react mypackage')
    .action(async (pkg, opts) => {
    console.log(chalk_1.default.blue(`
::::::::::: ::::::::  :::::::::  :::    :::
    :+:    :+:    :+: :+:    :+: :+:    :+:
    +:+    +:+        +:+    +:+  +:+  +:+
    +#+    +#++:++#++ +#+    +:+   +#++:+
    +#+           +#+ +#+    +#+  +#+  +#+
    #+#    #+#    #+# #+#    #+# #+#    #+#
    ###     ########  #########  ###    ###
`));
    const bootSpinner = ora_1.default(`Creating ${chalk_1.default.bold.green(pkg)}...`);
    let template;
    // Helper fn to prompt the user for a different
    // folder name if one already exists
    async function getProjectPath(projectPath) {
        const exists = await fs_extra_1.default.pathExists(projectPath);
        if (!exists) {
            return projectPath;
        }
        bootSpinner.fail(`Failed to create ${chalk_1.default.bold.red(pkg)}`);
        const prompt = new input_js_1.default({
            message: `A folder named ${chalk_1.default.bold.red(pkg)} already exists! ${chalk_1.default.bold('Choose a different name')}`,
            initial: pkg + '-1',
            result: (v) => v.trim(),
        });
        pkg = await prompt.run();
        projectPath = (await fs_extra_1.default.realpath(process.cwd())) + '/' + pkg;
        bootSpinner.start(`Creating ${chalk_1.default.bold.green(pkg)}...`);
        return await getProjectPath(projectPath); // recursion!
    }
    try {
        // get the project path
        const realPath = await fs_extra_1.default.realpath(process.cwd());
        let projectPath = await getProjectPath(realPath + '/' + pkg);
        const prompt = new select_js_1.default({
            message: 'Choose a template',
            choices: Object.keys(templates_1.templates),
        });
        if (opts.template) {
            template = opts.template.trim();
            if (!prompt.choices.includes(template)) {
                bootSpinner.fail(`Invalid template ${chalk_1.default.bold.red(template)}`);
                template = await prompt.run();
            }
        }
        else {
            template = await prompt.run();
        }
        bootSpinner.start();
        // copy the template
        await fs_extra_1.default.copy(path_1.default.resolve(__dirname, `../templates/${template}`), projectPath, {
            overwrite: true,
        });
        // fix gitignore
        await fs_extra_1.default.move(path_1.default.resolve(projectPath, './gitignore'), path_1.default.resolve(projectPath, './.gitignore'));
        // update license year and author
        let license = await fs_extra_1.default.readFile(path_1.default.resolve(projectPath, 'LICENSE'), { encoding: 'utf-8' });
        license = license.replace(/<year>/, `${new Date().getFullYear()}`);
        // attempt to automatically derive author name
        let author = getAuthorName();
        if (!author) {
            bootSpinner.stop();
            const licenseInput = new input_js_1.default({
                name: 'author',
                message: 'Who is the package author?',
            });
            author = await licenseInput.run();
            setAuthorName(author);
            bootSpinner.start();
        }
        license = license.replace(/<author>/, author.trim());
        await fs_extra_1.default.writeFile(path_1.default.resolve(projectPath, 'LICENSE'), license, {
            encoding: 'utf-8',
        });
        const templateConfig = templates_1.templates[template];
        const generatePackageJson = utils_2.composePackageJson(templateConfig);
        // Install deps
        process.chdir(projectPath);
        const safeName = utils_1.safePackageName(pkg);
        const pkgJson = generatePackageJson({ name: safeName, author });
        const nodeVersionReq = utils_1.getNodeEngineRequirement(pkgJson);
        if (nodeVersionReq &&
            !semver_1.default.satisfies(process.version, nodeVersionReq)) {
            bootSpinner.fail(Messages.incorrectNodeVersion(nodeVersionReq));
            process.exit(1);
        }
        await fs_extra_1.default.outputJSON(path_1.default.resolve(projectPath, 'package.json'), pkgJson);
        bootSpinner.succeed(`Created ${chalk_1.default.bold.green(pkg)}`);
        await Messages.start(pkg);
    }
    catch (error) {
        bootSpinner.fail(`Failed to create ${chalk_1.default.bold.red(pkg)}`);
        logError_1.default(error);
        process.exit(1);
    }
    const templateConfig = templates_1.templates[template];
    const { dependencies: deps } = templateConfig;
    const installSpinner = ora_1.default(Messages.installing(deps.sort())).start();
    try {
        const cmd = await getInstallCmd_1.default();
        await execa_1.default(cmd, getInstallArgs_1.default(cmd, deps));
        installSpinner.succeed('Installed dependencies');
        console.log(await Messages.start(pkg));
    }
    catch (error) {
        installSpinner.fail('Failed to install dependencies');
        logError_1.default(error);
        process.exit(1);
    }
});
prog
    .command('watch')
    .describe('Rebuilds on any change')
    .option('--entry, -i', 'Entry module')
    .example('watch --entry src/foo.tsx')
    .option('--target', 'Specify your target environment', 'browser')
    .example('watch --target node')
    .option('--name', 'Specify name exposed in UMD builds')
    .example('watch --name Foo')
    .option('--format', 'Specify module format(s)', 'cjs,esm')
    .example('watch --format cjs,esm')
    .option('--verbose', 'Keep outdated console output in watch mode instead of clearing the screen')
    .example('watch --verbose')
    .option('--noClean', "Don't clean the dist folder")
    .example('watch --noClean')
    .option('--tsconfig', 'Specify custom tsconfig path')
    .example('watch --tsconfig ./tsconfig.foo.json')
    .option('--onFirstSuccess', 'Run a command on the first successful build')
    .example('watch --onFirstSuccess "echo The first successful build!"')
    .option('--onSuccess', 'Run a command on a successful build')
    .example('watch --onSuccess "echo Successful build!"')
    .option('--onFailure', 'Run a command on a failed build')
    .example('watch --onFailure "The build failed!"')
    .option('--transpileOnly', 'Skip type checking')
    .example('watch --transpileOnly')
    .option('--extractErrors', 'Extract invariant errors to ./errors/codes.json.')
    .example('watch --extractErrors')
    .action(async (dirtyOpts) => {
    const opts = await normalizeOpts(dirtyOpts);
    const buildConfigs = await createBuildConfigs_1.createBuildConfigs(opts);
    if (!opts.noClean) {
        await cleanDistFolder();
    }
    if (opts.format.includes('cjs')) {
        await writeCjsEntryFile(opts.name);
    }
    if (opts.format.includes('esm')) {
        await writeMjsEntryFile(opts.name);
    }
    await cleanOldJS();
    let firstTime = true;
    let successKiller = null;
    let failureKiller = null;
    function run(command) {
        if (!command) {
            return null;
        }
        const [exec, ...args] = command.split(' ');
        return execa_1.default(exec, args, {
            stdio: 'inherit',
        });
    }
    function killHooks() {
        return Promise.all([
            successKiller ? successKiller.kill('SIGTERM') : null,
            failureKiller ? failureKiller.kill('SIGTERM') : null,
        ]);
    }
    const spinner = ora_1.default().start();
    rollup_1.watch(buildConfigs.map((inputOptions) => ({
        watch: {
            silent: true,
            include: ['src/**'],
            exclude: ['node_modules/**'],
        },
        ...inputOptions,
    }))).on('event', async (event) => {
        // clear previous onSuccess/onFailure hook processes so they don't pile up
        await killHooks();
        if (event.code === 'START') {
            if (!opts.verbose) {
                utils_1.clearConsole();
            }
            spinner.start(chalk_1.default.bold.cyan('Compiling modules...'));
        }
        if (event.code === 'ERROR') {
            spinner.fail(chalk_1.default.bold.red('Failed to compile'));
            logError_1.default(event.error);
            failureKiller = run(opts.onFailure);
        }
        if (event.code === 'END') {
            spinner.succeed(chalk_1.default.bold.green('Compiled successfully'));
            console.log(`
  ${chalk_1.default.dim('Watching for changes')}
`);
            try {
                await deprecated.moveTypes();
                if (firstTime && opts.onFirstSuccess) {
                    firstTime = false;
                    run(opts.onFirstSuccess);
                }
                else {
                    successKiller = run(opts.onSuccess);
                }
            }
            catch (_error) { }
        }
    });
});
prog
    .command('build')
    .describe('Build your project once and exit')
    .option('--entry, -i', 'Entry module')
    .example('build --entry src/foo.tsx')
    .option('--target', 'Specify your target environment', 'browser')
    .example('build --target node')
    .option('--name', 'Specify name exposed in UMD builds')
    .example('build --name Foo')
    .option('--format', 'Specify module format(s)', 'cjs,esm')
    .example('build --format cjs,esm')
    .option('--legacy', 'Babel transpile and emit ES5.')
    .example('build --legacy')
    .option('--tsconfig', 'Specify custom tsconfig path')
    .example('build --tsconfig ./tsconfig.foo.json')
    .option('--transpileOnly', 'Skip type checking')
    .example('build --transpileOnly')
    .option('--extractErrors', 'Extract errors to ./errors/codes.json and provide a url for decoding.')
    .example('build --extractErrors=https://reactjs.org/docs/error-decoder.html?invariant=')
    .action(async (dirtyOpts) => {
    const opts = await normalizeOpts(dirtyOpts);
    const buildConfigs = await createBuildConfigs_1.createBuildConfigs(opts);
    console.log('> Cleaning dist/ and compiling TS.');
    await cleanDistFolder();
    await simple_ts_1.runTsc();
    const progressIndicator = await createProgressEstimator_1.createProgressEstimator();
    if (opts.format.includes('cjs')) {
        await progressIndicator(writeCjsEntryFile(opts.name).catch(logError_1.default), 'Creating CJS entry file');
    }
    if (opts.format.includes('esm')) {
        await progressIndicator(writeMjsEntryFile(opts.name).catch(logError_1.default), 'Creating MJS entry file');
    }
    try {
        await progressIndicator(Promise.all(buildConfigs.map(async (buildConfig) => {
            const bundle = await rollup_1.rollup(buildConfig);
            await bundle.write(buildConfig.output);
        })), 'JS ➡ JS: Compressing and transforming emitted TypeScript output.');
        /**
         * Remove old index.js.
         */
        await cleanOldJS();
    }
    catch (error) {
        logError_1.default(error);
        process.exit(1);
    }
});
async function normalizeOpts(opts) {
    return {
        ...opts,
        name: opts.name || appPackageJson.name,
        input: await getInputs(opts.entry, appPackageJson.source),
        format: opts.format.split(',').map((format) => {
            if (format === 'es') {
                return 'esm';
            }
            return format;
        }),
    };
}
async function cleanOldJS() {
    const progressIndicator = await createProgressEstimator_1.createProgressEstimator();
    const oldJS = await glob_promise_1.default(`${constants_1.paths.appDist}/**/*.js`);
    // console.log({ oldJS });
    await progressIndicator(Promise.all(oldJS.map(async (file) => await fs_extra_1.default.unlink(file))), 'Removing original emitted TypeScript output (dist/**/*.js).');
}
async function cleanDistFolder() {
    await fs_extra_1.default.remove(constants_1.paths.appDist);
}
function writeCjsEntryFile(name) {
    const safeName = utils_1.safePackageName(name);
    /**
     * After an hour of tinkering, this is the *only* way to write this code that
     * will not break Rollup (by pulling process.env.NODE_ENV out with
     * destructuring).
     */
    const contents = `#!/usr/bin/env node

'use strict';
require('./${safeName}.cjs');
`;
    return fs_extra_1.default.outputFile(path_1.default.join(constants_1.paths.appDist, 'index.cjs'), contents);
}
function writeMjsEntryFile(name) {
    const contents = `#!/usr/bin/env node

export { default } from './${name}.mjs';
export * from './${name}.mjs';
`;
    return fs_extra_1.default.outputFile(path_1.default.join(constants_1.paths.appDist, 'index.mjs'), contents);
}
function getAuthorName() {
    let author = '';
    author = shelljs_1.default
        .exec('npm config get init-author-name', { silent: true })
        .stdout.trim();
    if (author)
        return author;
    author = shelljs_1.default
        .exec('git config --global user.name', { silent: true })
        .stdout.trim();
    if (author) {
        setAuthorName(author);
        return author;
    }
    author = shelljs_1.default
        .exec('npm config get init-author-email', { silent: true })
        .stdout.trim();
    if (author)
        return author;
    author = shelljs_1.default
        .exec('git config --global user.email', { silent: true })
        .stdout.trim();
    if (author)
        return author;
    return author;
}
function setAuthorName(author) {
    shelljs_1.default.exec(`npm config set init-author-name "${author}"`, { silent: true });
}
prog
    .command('test')
    .describe('Run jest test runner. Passes through all flags directly to Jest')
    .action(async (opts) => {
    // Do this as the first thing so that any code reading it knows the right env.
    process.env.BABEL_ENV = 'test';
    process.env.NODE_ENV = 'test';
    // Makes the script crash on unhandled rejections instead of silently
    // ignoring them. In the future, promise rejections that are not handled will
    // terminate the Node.js process with a non-zero exit code.
    process.on('unhandledRejection', (err) => {
        throw err;
    });
    const argv = process.argv.slice(2);
    let jestConfig = {
        ...createJestConfig_1.createJestConfig((relativePath) => path_1.default.resolve(__dirname, '..', relativePath), opts.config ? path_1.default.dirname(opts.config) : constants_1.paths.appRoot),
        ...appPackageJson.jest,
    };
    // Allow overriding with jest.config
    const defaultPathExists = await fs_extra_1.default.pathExists(constants_1.paths.jestConfig);
    if (opts.config || defaultPathExists) {
        const jestConfigPath = utils_1.resolveApp(opts.config || constants_1.paths.jestConfig);
        const jestConfigContents = require(jestConfigPath);
        jestConfig = { ...jestConfig, ...jestConfigContents };
    }
    // if custom path, delete the arg as it's already been merged
    if (opts.config) {
        let configIndex = argv.indexOf('--config');
        if (configIndex !== -1) {
            // case of "--config path", delete both args
            argv.splice(configIndex, 2);
        }
        else {
            // case of "--config=path", only one arg to delete
            const configRegex = /--config=.+/;
            configIndex = argv.findIndex((arg) => arg.match(configRegex));
            if (configIndex !== -1) {
                argv.splice(configIndex, 1);
            }
        }
    }
    argv.push('--config', JSON.stringify({
        ...jestConfig,
    }));
    const [, ...argsToPassToJestCli] = argv;
    jest_1.default.run(argsToPassToJestCli);
});
prog
    .command('lint')
    .describe('Run eslint with Prettier')
    .example('lint src test')
    .option('--fix', 'Fixes fixable errors and warnings')
    .example('lint src test --fix')
    .option('--ignore-pattern', 'Ignore a pattern')
    .example('lint src test --ignore-pattern test/foobar.ts')
    .option('--max-warnings', 'Exits with non-zero error code if number of warnings exceed this number', Infinity)
    .example('lint src test --max-warnings 10')
    .option('--write-file', 'Write the config file locally')
    .example('lint --write-file')
    .option('--report-file', 'Write JSON report to file locally')
    .example('lint --report-file eslint-report.json')
    .action(async (opts) => {
    if (opts['_'].length === 0 && !opts['write-file']) {
        const defaultInputs = ['src', 'test'].filter(fs_extra_1.default.existsSync);
        opts['_'] = defaultInputs;
        console.log(chalk_1.default.yellow(`Defaulting to "tsdx lint ${defaultInputs.join(' ')}"`, '\nYou can override this in the package.json scripts, like "lint": "tsdx lint src otherDir"'));
    }
    const config = await createEslintConfig_1.createEslintConfig({
        pkg: appPackageJson,
        rootDir: constants_1.paths.appRoot,
        writeFile: opts['write-file'],
    });
    const cli = new eslint_1.CLIEngine({
        baseConfig: {
            ...config,
            ...appPackageJson.eslint,
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fix: opts.fix,
        ignorePattern: opts['ignore-pattern'],
    });
    const report = cli.executeOnFiles(opts['_']);
    if (opts.fix) {
        eslint_1.CLIEngine.outputFixes(report);
    }
    console.log(cli.getFormatter()(report.results));
    if (opts['report-file']) {
        await fs_extra_1.default.outputFile(opts['report-file'], cli.getFormatter('json')(report.results));
    }
    if (report.errorCount) {
        process.exit(1);
    }
    if (report.warningCount > opts['max-warnings']) {
        process.exit(1);
    }
});
prog.parse(process.argv);
