var path = require('path');
var webpack = require('webpack');

module.exports = {
  // devtool: 'source-map',
  entry: [
    './app'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  plugins: [
    // exclude Moment locales (400 kB)
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
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
        loaders: ['babel-loader?stage=1'],
        include: __dirname,
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
    ]
  }
};
