export const composePackageJson = (template) => ({ name, author }) => {
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
            {
                path: `dist/${name}.min.mjs`,
                limit: '10 KB',
            },
        ],
    };
};
