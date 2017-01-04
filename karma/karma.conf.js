// Karma configuration
module.exports = function (config) {
  config.set({

    autoWatch: true,
    browsers: ['Chrome', 'PhantomJS'],

    files: [
      '../node_modules/es6-shim/es6-shim.min.js',
      'karma.entry.js'
    ],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],
    logLevel: config.LOG_DEBUG,

    

    phantomJsLauncher: {
      exitOnResourceError: true
    },

    preprocessors: {
      'karma.entry.js': ['webpack', 'sourcemap']
    },


    reporters: ['dots'],
    singleRun: false,

    webpack: require('../config/webpack.test'),
    webpackServer: {
      noInfo: true
    }
  });
};
