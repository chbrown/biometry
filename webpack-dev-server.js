var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: {chunks: false},
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use('/build', express.static('build'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT, 'localhost', function(error) {
  if (error) {
    return console.log(error);
  }
  var address = this.address();
  console.log(`Listening at http://${address.address}:${address.port}/`);
});
