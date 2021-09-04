import { Template } from '../template';

interface ProjectArgs {
  name: string;
  author: string;
}
export const composePackageJson =
  (template: Template) =>
  ({ name, author }: ProjectArgs) => {
    return {
      name,
      author,
      ...template.packageJson,
      // 'size-limit': [
      //   {
      //     path: `dist/${name}.cjs`,
      //     limit: '10 KB',
      //   },
      //   {
      //     path: `dist/${name}.js`,
      //     limit: '10 KB',
      //   },
      // ],
    };
  };
