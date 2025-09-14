const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        "constants": require.resolve("constants-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "https-browserify": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "process": require.resolve("process/browser"),
        "stream": require.resolve("stream-browserify"),
        "url": require.resolve("url/"),
      };
      
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js', 
        }),
      ]);

      return webpackConfig;
    },
  },
};