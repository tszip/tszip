"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.evalToString=function r(e){switch(e.type){case"StringLiteral":case"Literal":return e.value;case"BinaryExpression":if("+"!==e.operator)throw new Error("Unsupported binary operator "+e.operator);return r(e.left)+r(e.right);default:throw new Error("Unsupported type "+e.type)}};
//# sourceMappingURL=evalToString.cjs.map
