const path = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';

module.exports = {
  entry: [
    './app',
    ...(env === 'development' ? ['webpack-hot-middleware/client'] : []),
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      "__WEBPACK_TIMESTAMP__": JSON.stringify(new Date().toISOString()),
    }),
    // exclude Moment locales (400 kB)
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
    ...(env === 'development' ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
    ] : [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin(),
    ]),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
};
