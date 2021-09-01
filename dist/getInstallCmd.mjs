import r from"execa/index.js";let t;async function n(){if(t)return t;try{await r("yarnpkg",["--version"]),t="yarn"}catch(r){t="npm"}return t}export default n;
//# sourceMappingURL=getInstallCmd.mjs.map
