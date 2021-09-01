import s from"fs-extra/lib/index.js";import o from"path";import"camelcase/index.js";const r=s.realpathSync(process.cwd()),e=function(s){return o.resolve(r,s)},t={appPackageJson:e("package.json"),tsconfigJson:e("tsconfig.json"),testsSetup:e("test/setupTests.ts"),appRoot:e("."),appSrc:e("src"),appErrorsJson:e("errors/codes.json"),appErrors:e("errors"),appDist:e("dist"),appConfig:e("export-ts.config.js"),jestConfig:e("jest.config.js"),progressEstimatorCache:e("node_modules/.cache/.progress-estimator")};export{t as paths};
export default {};
//# sourceMappingURL=constants.mjs.map
