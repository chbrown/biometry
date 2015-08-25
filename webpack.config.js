var path = require('path');
var webpack = require('webpack');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");

var production = process.env.NODE_ENV == 'production';

var plugins = production ? [
  // exclude Moment locales (400 kB)
  new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
] : [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
];

var loaders = [
  {
    test: /\.less$/,
    loaders: ['style-loader', 'css-loader', 'less-loader'],
  },
  {
    test: /\.jsx$/,
    loaders: (production ? ['react-hot-loader'] : []).concat('babel-loader?stage=1'),
    include: __dirname,
  },
];

var extra_entry = production ? [] : [
  'webpack-dev-server/client?http://localhost:8080',
  // 'webpack/hot/dev-server',
  'webpack/hot/only-dev-server',
];

module.exports = {
  devtool: 'eval', // 'source-map',
  entry: extra_entry.concat('./app'),
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
    loaders: loaders,
  }
};
