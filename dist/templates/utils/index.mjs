const i=i=>({name:t,author:a})=>({...i.packageJson,name:t,author:a,"size-limit":[{path:`dist/${t}.production.min.cjs`,limit:"10 KB"},{path:`dist/${t}.min.mjs`,limit:"10 KB"}]});export{i as composePackageJson};
export default {};
//# sourceMappingURL=index.mjs.map
