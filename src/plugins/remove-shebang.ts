/**
 * Custom plugin that removes shebang from code because newer versions of
 * bublé bundle their own private version of `acorn` and we can't find a
 * way to patch in the option `allowHashBang` to acorn. Taken from
 * microbundle.
 *
 * @see https://github.com/Rich-Harris/buble/pull/165
 */
const shebangRegex = /^#!(.*)/;

export const removeShebang = () => {
  return {
    name: 'Remove shebang',
    transform(code: string) {
      code = code.replace(shebangRegex, '');

      return {
        code,
        map: null,
      };
    },
  };
};
