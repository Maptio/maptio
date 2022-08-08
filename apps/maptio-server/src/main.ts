import express from 'express';

import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import apicache from 'apicache';
import sslRedirect from 'heroku-ssl-redirect';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { environment } from './environments/environment';
import { getClosestSupportedLocale } from './i18n/get-closest-supported-locale';
import { setUpAuth0ManagementClient } from './auth/management-client';

dotenv.config();

const app = express();

const DIST_DIR = path.join(__dirname, '../maptio/');
const HTML_FILE_NAME = 'index.html';

const LOCALES = ['en-US', 'fr', 'pl'];
const DEFAULT_LOCALE = 'en-US';

const DEFAULT_PORT = 3000;
const port = process.env.PORT || DEFAULT_PORT;

const audience = process.env.AUTH0_AUDIENCE;
const issuer = process.env.AUTH0_ISSUER;

//
// Auth0 Management API Client
//
setUpAuth0ManagementClient();

//
// Security
//
// https://auth0.com/blog/node-js-and-typescript-tutorial-secure-an-express-api/
const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuer}.well-known/jwks.json`,
  }),

  audience,
  issuer,
  algorithms: ['RS256'],
  requestProperty: 'token',
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

    return res
      .status(401)
      .send(`Insufficient scopes - I need ${scopes}, you got ${userScopes}`);
  };
}

if (!environment.isDevelopment) {
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'maxcdn.bootstrapcdn.com',
          'cdnjs.cloudflare.com',
          'fonts.googleapis.com',
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'maxcdn.bootstrapcdn.com',
          'cdnjs.cloudflare.com',
          'cdn.auth0.com',
          'https://*.logrocket.io',
          'widget.intercom.io',
          'https://app.intercom.io',
          'https://js.intercomcdn.com',
          'https://fullstory.com',
          'https://static.hotjar.com',
          'code.jquery.com',
        ],
        fontSrc: [
          "'self'",
          'maxcdn.bootstrapcdn.com',
          'cdn.mixpnl.com',
          'https://js.intercomcdn.com',
          'fonts.gstatic.com',
        ],
        connectSrc: [
          "'self'",
          'api.cloudinary.com',
          'circlemapping.auth0.com',
          'login.maptio.com',
          'https://maptio-staging.us.auth0.com/oauth/token',
          'https://api.intercom.io',
          'https://api-iam.intercom.io',
          'https://api-ping.intercom.io',
          'https://nexus-websocket-a.intercom.io',
          'https://nexus-websocket-b.intercom.io',
          'https://nexus-long-poller-a.intercom.io',
          'https://nexus-long-poller-b.intercom.io',
          'wss://nexus-websocket-a.intercom.io',
          'wss://nexus-websocket-b.intercom.io',
          'https://uploads.intercomcdn.com',
          'https://uploads.intercomusercontent.com',
          'https://drive.google.com',
          'https://*.logrocket.io',
          'https://slack.com/api/',
          'https://*.openreplay.com',
        ],
        frameSrc: [
          'https://www.termsfeed.com',
          'https://termsfeed.com',
          'https://login.maptio.com',
          'https://maptio-staging.us.auth0.com',
          'https://maptio.chargebee.com',
        ],
        childSrc: [
          "'self'",
          'blob:',
          'https://share.intercom.io',
          'https://www.youtube.com',
          'https://player.vimeo.com',
          'https://fast.wistia.net',
          'https://drive.google.com',
          'https://termsfeed.com/',
          'https://circlemapping.auth0.com/',
          'login.maptio.com',
          'https://maptio-staging.us.auth0.com/',
          'https://maptio.chargebee.com',
          'https://intercom-sheets.com',
        ],
        workerSrc: ["'self'", 'blob:', 'blob: https://*.openreplay.com'],
        imgSrc: ['data:', "'self'", '*'],
      },
    })
  );
}

//
// Middleware
//
const cache = apicache.middleware;
app.use(express.text({ type: 'text/html', limit: '5mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(sslRedirect());
app.use(compression());
app.use(cookieParser());

//
// API routes
//
const datasets = require('./routes/datasets');
const embeddableDatasets = require('./routes/embeddable-datasets');
const users = require('./routes/users');
const teams = require('./routes/teams');
const inviting = require('./routes/invite');
const encoding = require('./routes/encoding');
const images = require('./routes/images');
const notifications = require('./routes/notifications');
const oauth = require('./routes/oauth');
const intercom = require('./routes/intercom');

app.use('/api/v1/jwt/', encoding);

app.use('/api/v1/images/', jwtCheck, checkscopes(['api']), images);
app.use(
  '/api/v1/notifications/',
  jwtCheck,
  checkscopes(['api']),
  notifications
);
app.use('/api/v1/oauth', jwtCheck, checkscopes(['api']), oauth);
app.use('/api/v1/dataset/', jwtCheck, checkscopes(['api']), datasets);
app.use('/api/v1/user', jwtCheck, checkscopes(['api']), users);
app.use('/api/v1/team', jwtCheck, checkscopes(['api']), teams);
app.use('/api/v1/invite', jwtCheck, checkscopes(['api']), inviting);
app.use('/api/v1/intercom', jwtCheck, checkscopes(['api']), intercom);

// Unprotected endpoint for use for publicly shared embeddable maps
app.use('/api/v1/embeddable-dataset/', embeddableDatasets);

//
// Server
//

app.set('port', port);
app.get(cache('5 seconds'));

if (!environment.isDevelopment) {
  app.use(express.static(DIST_DIR));

  // Make it possible to use the /embed/ route in an iframe by removing the
  // header that blocks this
  app.use('/embed/', function (req, res, next) {
    res.removeHeader('X-Frame-Options');
    next();
  });

  // If a supported locale is present in the path, we will use that to send the
  // appropriate index.html for that locale
  let localePath = '';
  LOCALES.forEach((locale) => {
    app.use(`/${locale}/`, function (req, res, next) {
      localePath = locale;
      next();
    });
  });

  // For any other requests, serve the static Angular bundle
  app.get('*', function (req, res, next) {

    // Set locale based on cookie (if set previously by language picker) or
    // language headers or default to English if we don't support  a matching
    // locale
    if (localePath === '') {
      let preferredLocales = [];

      if (req.cookies.locale) {
        preferredLocales.push(req.cookies.locale);
      }
      preferredLocales = preferredLocales.concat(req.acceptsLanguages());

      localePath = getClosestSupportedLocale(
        preferredLocales,
        LOCALES,
        DEFAULT_LOCALE
      );
    }

    const HTML_FILE = path.join(DIST_DIR, localePath, HTML_FILE_NAME);
    res.sendFile(HTML_FILE);
  });
}

const server = app.listen(port, () => {
  console.info(
    `==> 🌎 Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`
  );
});
server.on('error', console.error);
