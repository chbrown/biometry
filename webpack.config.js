var path = require('path');
var webpack = require('webpack');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    // 'webpack/hot/dev-server',
    'webpack/hot/only-dev-server',
    './app'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
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
        test: /\.jsx$/,
        loaders: ['react-hot-loader', 'babel-loader?stage=1'],
        include: __dirname,
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
    ]
  }
};
