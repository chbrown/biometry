var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

var devtool = production ? undefined : 'eval'; // 'source-map',

var entry = production ? [
  './app',
] : [
  'webpack-hot-middleware/client',
  './app',
];

var plugins = [
  // exclude Moment locales (400 kB)
  new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
].concat(production ? [
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
] : []);

module.exports = {
  devtool: devtool,
  entry: entry,
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  plugins: plugins,
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx'
    ],
  },
  module: {
    loaders: [
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.jsx$/,
        loaders: ['babel'],
        include: __dirname,
      },
    ],
  }
};
