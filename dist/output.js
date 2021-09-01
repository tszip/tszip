import escapes from 'ansi-escapes';
import chalk from 'chalk';
import ora from 'ora';
// This was copied from Razzle. Lots of unused stuff.
export const info = (msg) => {
    console.log(`${chalk.gray('>')} ${msg}`);
};
export const error = (msg) => {
    if (msg instanceof Error) {
        msg = msg.message;
    }
    console.error(`${chalk.red('> Error!')} ${msg}`);
};
export const success = (msg) => {
    console.log(`${chalk.green('> Success!')} ${msg}`);
};
export const wait = (msg) => {
    const spinner = ora(chalk.green(msg));
    spinner.color = 'blue';
    spinner.start();
    return () => {
        spinner.stop();
        process.stdout.write(escapes.eraseLine);
    };
};
export const cmd = (cmd) => {
    return chalk.bold(chalk.cyan(cmd));
};
export const code = (cmd) => {
    return `${chalk.gray('`')}${chalk.bold(cmd)}${chalk.gray('`')}`;
};
export const param = (param) => {
    return chalk.bold(`${chalk.gray('{')}${chalk.bold(param)}${chalk.gray('}')}`);
};
