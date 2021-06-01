import express from 'express';

import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import apicache from 'apicache';
import sslRedirect from 'heroku-ssl-redirect';
import compression from 'compression';


dotenv.config();

const app = express();

const DIST_DIR = path.join(__dirname, "../current/");
const HTML_FILE = path.join(DIST_DIR, "index.html");
const DEFAULT_PORT = 3000;

const isDevelopment = process.env.NODE_ENV !== "production";
const port = process.env.PORT || DEFAULT_PORT;


//
// Security
//
// https://auth0.com/blog/node-js-and-typescript-tutorial-secure-an-express-api/
const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://login.maptio.com/.well-known/jwks.json"
  }),

  audience: 'https://app.maptio.com/api/v1',
  issuer: "https://login.maptio.com/",
  algorithms: ['RS256'],
  requestProperty: 'token'
});

function checkscopes(scopes) {
  return function (req, res, next) {
    const token = req.token;
    const userScopes = token.scope.split(' ');

    for (let i = 0; i < userScopes.length; i++) {
      for (let j = 0; j < scopes.length; j++) {
        if (scopes[j] === userScopes[i]) return next();
      }
    }

    return res.status(401).send(`Insufficient scopes - I need ${scopes}, you got ${userScopes}`);
  }
}

if (!isDevelopment) {
  app.use(helmet())
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'maxcdn.bootstrapcdn.com',
      'cdnjs.cloudflare.com', 'api.mixpanel.com','fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        'maxcdn.bootstrapcdn.com', 'cdnjs.cloudflare.com', 'cdn.auth0.com', 'api.mixpanel.com',
        'cdn.mxpnl.com', 'cdn4.mxpnl.com',
        'https://*.logrocket.io',
        'www.google-analytics.com', 'mixpanel.com', 'widget.intercom.io', 'https://app.intercom.io',
        'https://js.intercomcdn.com', 'https://fullstory.com','https://static.hotjar.com', 'code.jquery.com'],
      fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com', 'cdn.mixpnl.com', 'https://js.intercomcdn.com','fonts.gstatic.com'],
      connectSrc: ["'self'", 'api.mixpanel.com', 'api.cloudinary.com', 'circlemapping.auth0.com', 'login.maptio.com','www.google-analytics.com', 'mixpanel.com', 'https://api.intercom.io', 'https://api-iam.intercom.io',
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
      frameSrc:[
        'https://www.termsfeed.com',
        'https://termsfeed.com',
        'https://login.maptio.com',
        'https://maptio.chargebee.com'
      ],
      childSrc: [
        "'self'",'blob:',
        'https://share.intercom.io',
        'https://www.youtube.com',
        'https://player.vimeo.com',
        'https://fast.wistia.net',
        'https://drive.google.com',
        'https://termsfeed.com/',
        'https://circlemapping.auth0.com/','login.maptio.com',
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


//
// Middleware
//
const cache = apicache.middleware;
app.use(express.text({ type: "text/html", limit: '5mb' }))
app.use(express.json({ limit: '1mb' }));
app.use(sslRedirect());
app.use(compression())


//
// API routes
//
var datasets = require('./routes/datasets');
var embeddableDatasets = require('./routes/embeddable-datasets');
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

app.use('/api/v1/images/', jwtCheck, checkscopes(["api"]), images)
app.use('/api/v1/notifications/', jwtCheck, checkscopes(["api"]), notifications)
app.use('/api/v1/oauth', jwtCheck, checkscopes(["api"]), oauth);
app.use('/api/v1/mail/invite', jwtCheck, checkscopes(["invite"]), inviting);
app.use('/api/v1/dataset/', jwtCheck, checkscopes(["api"]), datasets);
app.use('/api/v1/user', jwtCheck, checkscopes(["api"]), users);
app.use('/api/v1/team', jwtCheck, checkscopes(["api"]), teams);
app.use('/api/v1/intercom', jwtCheck, checkscopes(["api"]), intercom);

// Unprotected endpoint for use for publicly shared embeddable maps
app.use('/api/v1/embeddable-dataset/', embeddableDatasets);


//
// Server
//
app.set("port", port);
app.get(cache('5 seconds'));

if (!isDevelopment) {
  app.use(express.static(DIST_DIR));

  // For any other requests, serve the static Angular bundle
  app.get("*", function (req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }

    res.sendFile(HTML_FILE);
  });
}

const server = app.listen(port, () => {
  console.info(`==> 🌎 Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`);
});
server.on('error', console.error);
