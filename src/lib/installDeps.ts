import execa from 'execa';
let cmd: InstallCommand;

export type InstallCommand = 'yarn' | 'npm';

export async function getInstallCmd(): Promise<InstallCommand> {
  if (cmd) {
    return cmd;
  }

  try {
    await execa('yarnpkg', ['--version']);
    cmd = 'yarn';
  } catch (e) {
    cmd = 'npm';
  }

  return cmd;
}

export function getInstallArgs(cmd: InstallCommand, packages: string[]) {
  switch (cmd) {
    case 'npm':
      return ['install', ...packages, '--save-dev'];
    case 'yarn':
      return ['add', ...packages, '--dev'];
  }
}
