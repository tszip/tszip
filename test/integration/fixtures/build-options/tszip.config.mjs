const tszipConfig = {
  rollup(config, options) {
    config.plugins.push({
      name: 'Just a test!',
    });
    return config;
  },
};

export default tszipConfig;
