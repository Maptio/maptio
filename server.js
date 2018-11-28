require('newrelic');

require('dotenv').config()
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const sslRedirect = require('heroku-ssl-redirect');
const compression = require('compression')
const apicache = require('apicache')
const helmet = require('helmet')
const fs = require('fs')
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://circlemapping.auth0.com/.well-known/jwks.json"
  }),

  audience: 'https://app.maptio.com/api/v1',
  issuer: "https://circlemapping.auth0.com/",
  algorithms: ['RS256'],
  requestProperty: 'token'
});


function check_scopes(scopes) {
  return function (req, res, next) {
    var token = req.token;
    var userScopes = token.scope.split(' ');
    for (var i = 0; i < userScopes.length; i++) {
      for (var j = 0; j < scopes.length; j++) {
        if (scopes[j] === userScopes[i]) return next();
      }
    }
    return res.status(401).send(`Insufficient scopes - I need ${scopes}, you got ${userScopes}`)
  }
}

const app = express(),
  DIST_DIR = path.join(__dirname, "dist"),
  HTML_FILE = path.join(DIST_DIR, "index.html"),
  isDevelopment = process.env.NODE_ENV !== "production",
  DEFAULT_PORT = 3000,
  compiler = webpack(config);

if (!isDevelopment) {
  app.use(helmet())
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'maxcdn.bootstrapcdn.com', 
      'cdnjs.cloudflare.com', 'api.mixpanel.com','fonts.googleapis.com', 'use.fontawesome.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        'maxcdn.bootstrapcdn.com', 'cdnjs.cloudflare.com', 'cdn.auth0.com', 'api.mixpanel.com',
        'cdn.mxpnl.com', 'cdn4.mxpnl.com',
        'https://*.logrocket.io',
        'www.google-analytics.com', 'mixpanel.com', 'widget.intercom.io', 'https://app.intercom.io',
        'https://js.intercomcdn.com', 'https://fullstory.com', 'code.jquery.com','http://canvg.github.io'],
      fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com', 'cdn.mixpnl.com', 'https://js.intercomcdn.com','fonts.gstatic.com', 'use.fontawesome.com'],
      connectSrc: ["'self'", 'api.mixpanel.com', 'api.cloudinary.com', 'circlemapping.auth0.com', 'www.google-analytics.com', 'mixpanel.com', 'https://api.intercom.io', 'https://api-iam.intercom.io',
        'https://api-ping.intercom.io',
        'https://nexus-websocket-a.intercom.io',
        'https://nexus-websocket-b.intercom.io',
        'https://nexus-long-poller-a.intercom.io',
        'https://nexus-long-poller-b.intercom.io',
        'wss://nexus-websocket-a.intercom.io',
        'wss://nexus-websocket-b.intercom.io',
        'https://uploads.intercomcdn.com',
        'https://uploads.intercomusercontent.com',
        'https://rs.fullstory.com',
        'https://drive.google.com',
        'https://*.logrocket.io',
        'https://slack.com/api/'
      ],
      childSrc: [
        "'self'",'blob:',
        'https://share.intercom.io',
        'https://www.youtube.com',
        'https://player.vimeo.com',
        'https://fast.wistia.net',
        'https://drive.google.com',
        'https://termsfeed.com/',
        'https://circlemapping.auth0.com/',
        'https://maptio.chargebee.com',
        'https://intercom-sheets.com'
      ],
      workerSrc : [
        "'self'",'blob:'
      ],
      imgSrc: ['data:', "'self'", '*']
    }
  }))
}


let cache = apicache.middleware
// app.use(cache('5 seconds'))
app.use(bodyParser.text({ type: "text/html", limit: '5mb' }))
app.use(bodyParser.json({ limit: '1mb' }));
app.use(sslRedirect());
app.use(compression())
// app.use(jwtCheck.unless({ path: ['/','/api/v1/mail/confirm', "/api/v1/jwt/encode", "/api/v1/jwt/decode"] }));

var datasets = require('./routes/datasets');
var users = require('./routes/users');
var teams = require('./routes/teams');
var inviting = require('./routes/invite-mail');
var confirming = require('./routes/confirm-mail');
var encoding = require('./routes/encoding');
var images = require('./routes/images');
var notifications = require('./routes/notifications');
var oauth = require('./routes/oauth');
var intercom = require("./routes/intercom");

app.use('/api/v1/jwt/', encoding);
app.use('/api/v1/mail/confirm', confirming);

app.use('/api/v1/images/', jwtCheck, check_scopes(["api"]), images)
app.use('/api/v1/notifications/', jwtCheck, check_scopes(["api"]), notifications)
app.use('/api/v1/oauth', jwtCheck, check_scopes(["api"]), oauth);
app.use('/api/v1/mail/invite', jwtCheck, check_scopes(["invite"]), inviting);
app.use('/api/v1/dataset/', jwtCheck, check_scopes(["api"]), datasets);
app.use('/api/v1/user', jwtCheck, check_scopes(["api"]), users);
app.use('/api/v1/team', jwtCheck, check_scopes(["api"]), teams);
app.use('/api/v1/intercom', jwtCheck, check_scopes(["api"]), intercom);

app.set("port", process.env.PORT || DEFAULT_PORT);
app.get(cache('5 seconds'))

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
  console.info('==> 🌎 Listening on port %s. Open up http://localhost:%s/ in your browser.', app.get("port"), app.get("port"));
});