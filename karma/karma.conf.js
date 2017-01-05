'use strict';

module.exports = config => {
    config.set({
        autoWatch: true,
        browsers: ['Chrome', 'PhantomJS'],
        files: [
            '../node_modules/es6-shim/es6-shim.min.js',
            'karma.entry.js'
        ],
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        phantomJsLauncher: {
            exitOnResourceError: true
        },
        port: 9876,
        preprocessors: {
            'karma.entry.js': ['webpack', 'sourcemap']
        },
        reporters: ['dots'],
        singleRun: false,
        webpack: require('../config/webpack.test.js'),
        webpackServer: {
            noInfo: true
        }
    });
};