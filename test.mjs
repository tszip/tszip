// import{createRequire as m}from"module";const require=m(import.meta.url);

// const require=await(async () => {
//   const { createRequire } = await import('module');
//   return createRequire(import.meta.url);
// })();
const require=await(async()=>{const{createRequire:t}=await import("module");return t(import.meta.url)})();