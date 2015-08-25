var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

var extra_plugins = production ? [
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
] : [];

var loaders = [
  {
    test: /\.less$/,
    loaders: ['style-loader', 'css-loader', 'less-loader'],
  },
  {
    test: /\.jsx$/,
    loaders: (production ? [] : ['react-hot-loader']).concat('babel-loader?stage=1'),
    include: __dirname,
  },
];

var extra_entry = production ? [] : [
  'webpack-dev-server/client?http://localhost:8080',
  // 'webpack/hot/dev-server',
  'webpack/hot/only-dev-server',
];

module.exports = {
  devtool: production ? undefined : 'eval', // 'source-map',
  entry: extra_entry.concat('./app'),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  plugins: [
    // exclude Moment locales (400 kB)
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
    new webpack.NoErrorsPlugin()
  ].concat(extra_plugins),
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
