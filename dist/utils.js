import fs from 'fs-extra';
import path from 'path';
import camelCase from 'camelcase';
// Remove the package name scope if it exists
export const removeScope = (name) => name.replace(/^@.*\//, '');
// UMD-safe package name
export const safeVariableName = (name) => camelCase(removeScope(name)
    .toLowerCase()
    .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, ''));
export const safePackageName = (name) => name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
/**
 * These packages will not be resolved by Rollup and will be left as imports.
 */
export const EXTERNAL_PACKAGES = ['react', 'react-native'];
/**
 * Mark EXTERNAL_PACKAGES and all relative imports as external.
 */
export const external = (id) => EXTERNAL_PACKAGES.includes(id) || (id.startsWith('.') && path.isAbsolute(id));
// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
export const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = function (relativePath) {
    return path.resolve(appDirectory, relativePath);
};
// Taken from Create React App, react-dev-utils/clearConsole
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/clearConsole.js
export function clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}
export function getReactVersion({ dependencies, devDependencies, }) {
    return ((dependencies && dependencies.react) ||
        (devDependencies && devDependencies.react));
}
export function getNodeEngineRequirement({ engines }) {
    return engines && engines.node;
}
