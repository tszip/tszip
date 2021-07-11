"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composePackageJson = void 0;
const composePackageJson = (template) => ({ name, author }) => {
    return {
        ...template.packageJson,
        name,
        author,
        'size-limit': [
            {
                path: `dist/${name}.cjs`,
                limit: '10 KB',
            },
            {
                path: `dist/${name}.mjs`,
                limit: '10 KB',
            },
        ],
    };
};
exports.composePackageJson = composePackageJson;
