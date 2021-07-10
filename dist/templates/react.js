import basicTemplate from './basic';
const reactTemplate = {
    name: 'react',
    dependencies: [
        ...basicTemplate.dependencies,
        '@types/react',
        '@types/react-dom',
        'react',
        'react-dom',
    ],
    packageJson: {
        ...basicTemplate.packageJson,
        peerDependencies: {
            react: '>=16',
        },
        scripts: {
            ...basicTemplate.packageJson.scripts,
            test: 'tsdx test',
        },
    },
};
export default reactTemplate;
//# sourceMappingURL=react.js.map