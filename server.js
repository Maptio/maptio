require('newrelic');

// const sslRedirect = require('heroku-ssl-redirect');
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const sslRedirect = require('heroku-ssl-redirect');
// const apicache = require('apicache')
const helmet = require('helmet')

//const port = isDeveloping ? 3000 : process.env.PORT;

const app = express(),
  DIST_DIR = path.join(__dirname, "dist"),
  HTML_FILE = path.join(DIST_DIR, "index.html"),
  isDevelopment = process.env.NODE_ENV !== "production",
  DEFAULT_PORT = 3000,
  compiler = webpack(config);

app.use(helmet())
// let cache = apicache.middleware
// app.use(cache('1 minute'))

app.use(bodyParser.json());
// enable ssl redirect
app.use(sslRedirect());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'",'maxcdn.bootstrapcdn.com', 'cdnjs.cloudflare.com','api.mixpanel.com'],
    scriptSrc: ["'self'", "'unsafe-inline'","'unsafe-eval'", 'maxcdn.bootstrapcdn.com', 'cdnjs.cloudflare.com', 'cdn.auth0.com','api.mixpanel.com', 'cdn.mxpnl.com','www.google-analytics.com'],
    fontSrc: ['maxcdn.bootstrapcdn.com'],
    connectSrc: ["'self'",'api.mixpanel.com','circlemapping.auth0.com','www.google-analytics.com'],
    imgSrc: ['*']
  }
}))


var datasets = require('./routes/datasets');
var users = require('./routes/users');
var teams = require('./routes/teams');
var mailing = require('./routes/mail');
var encoding = require('./routes/encoding');

app.use('/api/v1/', datasets);
app.use('/api/v1/', users);
app.use('/api/v1/', teams);
app.use('/api/v1/', mailing);
app.use('/api/v1/', encoding);


app.set("port", process.env.PORT || DEFAULT_PORT);


if (isDevelopment) {
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
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'config/public/build/index.html')));
    res.end();
  });
} else {

  app.use(express.static(DIST_DIR));
  app.get("*", function (req, res, next) {
    // console.log("PRODUCTION")
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    res.sendFile(HTML_FILE);
  }
  )
}

app.listen(app.get("port"), '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://127.0.0.1:%s/ in your browser.', app.get("port"), app.get("port"));
});