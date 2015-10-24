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
].concat(production ? [
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
] : [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
]);

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
      '.jsx',
      '.ts',
    ],
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['ts-loader'],
        include: __dirname,
        exclude: /node_modules/,
      },
      {
        test: /\.jsx$/,
        loaders: ['babel-loader'],
        include: __dirname,
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  }
};
