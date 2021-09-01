import"fs";import"@babel/helper-module-imports";import s from"fs-extra/lib/index.js";import e from"path";import"camelcase/index.js";const o=s.realpathSync(process.cwd()),r=function(s){return e.resolve(o,s)};r("package.json"),r("tsconfig.json"),r("test/setupTests.ts"),r("."),r("src"),r("errors/codes.json"),r("errors"),r("dist"),r("export-ts.config.js"),r("jest.config.js"),r("node_modules/.cache/.progress-estimator");
export default {};
//# sourceMappingURL=index.mjs.map
