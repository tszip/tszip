export const indentString = (msg, indent = 1) => {
    return `${' '.repeat(indent * 2)}${msg}`;
};
export const indentLog = (msg, indent = 1) => {
    console.log(indentString(msg, indent));
};
