import TscWatchClient from 'tsc-watch/client';
const watcher = new TscWatchClient();

export const watch = async () => {
  watcher.on('first_success', () => {
    console.log('First success!');
  });

  watcher.on('success', () => {
    console.log('Success!');
  });

  watcher.on('compile_errors', () => {
    console.log('Oops, issues.');
  });

  watcher.start();
};

watch();
