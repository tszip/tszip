export const indentString = (msg: string, indent = 1) => {
  return `${' '.repeat(indent * 2)}${msg}`;
};

export const indentLog = (msg: string, indent = 1) => {
  console.log(indentString(msg, indent));
};

export const debugLog = (...msgs: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...msgs);
  }
};
