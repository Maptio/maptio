

// var express = require('express');
// var path = require('path');
// var httpProxy = require('http-proxy');
// var bodyParser = require('body-parser');

// var proxy = httpProxy.createProxyServer();
// var app = express();

// var isProduction = process.env.NODE_ENV === 'production';
// var port = isProduction ? process.env.PORT : 3000;
// var publicPath = path.resolve(__dirname, 'public', 'build');

// //Handles put requests
// app.use(bodyParser.json());

// var datasets = require('./routes/datasets');
// var users = require('./routes/users');


// app.use(express.static(publicPath));
// app.use('/api/v1/', datasets);
// app.use('/api/v1/', users);

// // We only want to run the workflow when not in production
// if (!isProduction) {

//   // We require the bundler inside the if block because
//   // it is only needed in a development environment. Later
//   // you will see why this is a good idea
//   var bundle = require('./server/bundle.js');
//   bundle();

//   // Any requests to localhost:3000/build is proxied
//   // to webpack-dev-server
//   app.all('/*', function (req, res) {
//     proxy.web(req, res, {
//       target: 'http://localhost:8080/build'
//     } );
//   });

// }




// // It is important to catch any errors from the proxy or the
// // server will crash. An example of this is connecting to the
// // server when webpack is bundling
// proxy.on('error', function (e) {
//   console.log('Could not connect to proxy, please try again...');
// });

// app.listen(port, function () {
//   console.log('Server running on port ' + port);
// });

/* eslint no-console: 0 */

const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

app.use(bodyParser.json());

var datasets = require('./routes/datasets');
var users = require('./routes/users');

app.use('/api/v1/', datasets);
app.use('/api/v1/', users);

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    console.log("CALL " + req.url);
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'config/public/build/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/build'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'build/index.html'));
  });
}

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});