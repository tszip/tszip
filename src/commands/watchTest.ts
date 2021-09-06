import TscWatchClient from 'tsc-watch/client';
// import { runRollup } from './rollup';
// import { runTsc } from './tsc';

export const watch = () => {
  const watcher = new TscWatchClient();

  watcher.on('first_success', async () => {
    console.log('First success!');
  });

  watcher.on('success', async () => {
    console.log('Running...', Date.now());
    // await runTsc();
    // await runRollup('dev', false);
    console.log('Success!', Date.now());
  });

  watcher.on('compile_errors', async () => {
    console.log('Oops, issues.');
  });

  watcher.start();
};
