import TscWatchClient from 'tsc-watch/client';
import { runRollup } from './rollup';

export const watch = () => {
  const watcher = new TscWatchClient();

  watcher.on('success', async () => {
    console.log('Finalizing imports...');
    await runRollup('dev', false);
    console.log('Success!');
  });

  watcher.on('compile_errors', async () => {
    console.log('Oops, issues.');
  });

  watcher.start();
};
