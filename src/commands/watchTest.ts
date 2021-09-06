import TscWatchClient from 'tsc-watch/client';
import { runRollup } from './rollup';
const watcher = new TscWatchClient();

export const watch = () => {
  watcher.on('first_success', () => {
    console.log('First success!');
  });

  watcher.on('success', async () => {
    console.log('Success!');
    await runRollup('dev', false);
  });

  watcher.on('compile_errors', () => {
    console.log('Oops, issues.');
  });

  watcher.start();
};
