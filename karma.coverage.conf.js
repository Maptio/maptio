'use strict';

module.exports = config => {
    config.set({
        autoWatch: true,
        browsers: ['Chrome', 'PhantomJS'],
        files: [
             //'./node_modules/es6-shim/es6-shim.min.js',
            './karma-test-shim.ts',
        //   
            //'./karma.entry.js',
      // serve assets and stylings
       { pattern: 'test/fixtures/**/*.*', watched: true, included: true, served: true },
    //   // webpack's entry point over tests
       { pattern: 'test/specs/**/*.ts', watched: true, included: true, served: true }
    ],
    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },
        
        frameworks: ['jasmine','fixture'],
        logLevel: config.LOG_ERROR,
        phantomJsLauncher: {
            exitOnResourceError: true
        },
        port: 9876,
        preprocessors: {
            'test/fixtures/**/*.html': ['html2js'],
            'test/fixtures/**/*.json': ['json_fixtures'],
            './karma-test-shim.ts':['webpack', 'sourcemap'],
            'test/**/*.ts': ['webpack', 'sourcemap','coverage']
        },
        reporters: ['progress','coverage'],
        singleRun: false,
         webpack: require('./config/webpack.test.js'),
        webpackServer: {
            noInfo: true
        },
         coverageReporter: {
      dir: 'test/coverage/',
      reporters: [
        // reporters not supporting the `file` property
        { type: 'html', subdir: 'report-html' },
        { type: 'text', subdir: '.', file: 'text.txt' },
        { type: 'text', subdir: '.', file: '' },
        { type: 'text-summary', subdir: '.', file: 'text-summary.txt' }
      ]
    },
        plugins: [
      'karma-fixture',
      'karma-html2js-preprocessor',
      'karma-json-fixtures-preprocessor',
      'karma-webpack',
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-coverage'
     
    ]

    });
};