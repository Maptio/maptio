require('newrelic');

const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
//const port = isDeveloping ? 3000 : process.env.PORT;

const app = express(),
  DIST_DIR = path.join(__dirname, "dist"),
  HTML_FILE = path.join(DIST_DIR, "index.html"),
  isDevelopment = process.env.NODE_ENV !== "production",
  DEFAULT_PORT  = 3000,
  compiler = webpack(config);


app.use(bodyParser.json());

var datasets = require('./routes/datasets');
var users = require('./routes/users');

app.use('/api/v1/', datasets);
app.use('/api/v1/', users);

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
  app.get("*", (req, res) => res.sendFile(HTML_FILE));
}

app.listen(app.get("port"), '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', app.get("port"), app.get("port"));
});