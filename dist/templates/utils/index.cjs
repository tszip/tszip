"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.composePackageJson=e=>({name:t,author:i})=>({...e.packageJson,name:t,author:i,"size-limit":[{path:`dist/${t}.production.min.cjs`,limit:"10 KB"},{path:`dist/${t}.min.mjs`,limit:"10 KB"}]});
//# sourceMappingURL=index.cjs.map
