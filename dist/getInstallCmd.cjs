"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e:{"default":e}}Object.defineProperty(exports,"__esModule",{value:!0});var t=e(require("execa/index.js"));let r;exports.default=async function(){if(r)return r;try{await t.default("yarnpkg",["--version"]),r="yarn"}catch(e){r="npm"}return r};
//# sourceMappingURL=getInstallCmd.cjs.map
