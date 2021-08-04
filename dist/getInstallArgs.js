export default function getInstallArgs(cmd, packages) {
    switch (cmd) {
        case 'npm':
            return ['install', ...packages, '--save-dev'];
        case 'yarn':
            return ['add', ...packages, '--dev'];
    }
}
