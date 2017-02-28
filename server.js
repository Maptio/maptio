// var express = require('express');
// var path = require('path');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var index = require('./routes/index');
// var todos = require('./routes/todos');
// var app = express();
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: false
// }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', index);
// app.use('/api/v1/', todos);
// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
// var server = app.listen(3000, function () {
//   var host = 'localhost';
//   var port = server.address().port;
//   console.log('App listening at http://%s:%s', host, port);
// });
// module.exports = app;

var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// We only want to run the workflow when not in production
if (!isProduction) {

  // We require the bundler inside the if block because
  // it is only needed in a development environment. Later
  // you will see why this is a good idea
  var bundle = require('./server/bundle.js');
  bundle();

  // Any requests to localhost:3000/build is proxied
  // to webpack-dev-server
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
  console.log('Server running on port ' + port);
});