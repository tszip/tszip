import { extname } from 'path';

export const renameExtension = (file: string, dotExtension: string) => {
  const oldExt = extname(file);
  return file.replace(new RegExp(`\\${oldExt}\$`), dotExtension);
};
