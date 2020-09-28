const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const mode = process.env.NODE_ENV || 'development'

module.exports = {
  mode,
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/_template.html',
      favicon: 'src/favicon.ico',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.WEBPACK_TIMESTAMP': JSON.stringify(new Date().toISOString()),
    }),
    // exclude Moment locales (400 kB)
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
}
