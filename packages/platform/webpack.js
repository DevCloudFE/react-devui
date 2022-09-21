const path = require('path');

const getWebpackConfig = require('@nrwl/react/plugins/webpack');
const { merge } = require('webpack-merge');

module.exports = (config, context) => {
  return merge(getWebpackConfig(config), {
    resolve: {
      alias: {
        '@react-devui/ui/styles': path.resolve(__dirname, '../ui/src/styles/'),
        styles: path.resolve(__dirname, './src/styles/'),
      },
    },
  });
};
