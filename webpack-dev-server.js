var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
});

server.listen(process.env.PORT, function(err) {
  if (err) {
    return console.log(err);
  }
  var address = this.address();

  console.log('Listening at %s:%s', address.address, address.port);
});
