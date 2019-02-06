process.env.CHROME_BIN = require('puppeteer').executablePath()


module.exports = function (config) {
    // config.set({

    //     frameworks: ["jasmine", "fixture", "karma-typescript"],

    //     files: [
    //         { pattern: "base.spec.ts" },
    //         { pattern: "src/app/**/*.*" },
    //         { pattern: "src/test/**/*.*" }
    //     ],

    //     jsonFixturesPreprocessor: {
    //         variableName: '__json__'
    //     },

    //     preprocessors: {
    //         "**/*.ts": ["karma-typescript"],
    //         '**/*.json': ['json_fixtures'],
    //         'src/app/shared/**/*.html': ['html2js']
    //     },

    //     browserConsoleLogOptions: {
    //         terminal: true,
    //         level: "error"
    //     },

    //     karmaTypescriptConfig: {
    //         compilerOptions: {
    //             lib: ["es2017", "dom", "es6", "es7"] // fix for "'Promise' only refers to a type"
    //         },
    //         bundlerOptions: {
    //             entrypoints: /\.spec\.ts$/,
    //             transforms: [
    //                 require("karma-typescript-angular2-transform"),
    //                 require("karma-typescript-es6-transform")()

    //             ]
    //         },
    //         coverageOptions: {
    //             exclude: [/(\/src\/test\/.*|\.d|base.spec|\.spec|\.module)\.ts/i]
    //         },
    //         reports: {
    //             "html": {
    //                 "directory": "coverage",
    //                 "subdirectory": "html",
    //                 "filename": "index.html"
    //             },
    //             "lcovonly": {
    //                 "directory": "coverage",
    //                 "subdirectory": "lcov",
    //                 "filename": "lcov.info"
    //             }
    //         }
    //     },

    //     logLevel: config.LOG_DEBUG,

    //     reporters: ["progress", "karma-typescript"],

    //     browsers: ["PhantomJS"]
    // });

    config.set({
        frameworks: ["jasmine",  "karma-typescript"],
        files: [
            { pattern: "base.spec.ts" },
            { pattern: "src/app/**/*.+(ts|html|json)" }
        ],

        preprocessors: {
            "**/*.ts": "karma-typescript",
            '**/*.json': ['json_fixtures']
        },

        karmaTypescriptConfig: {
            tsconfig : "./tsconfig.spec.json",
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                transforms: [
                    require("karma-typescript-es6-transform")(),
                    require("karma-typescript-angular2-transform")
                ]
            },
            // coverageOptions: {
            //     exclude: [/(\/src\/test\/.*|\.d|base.spec|\.spec|\.module)\.ts/i]
            // },
            // reports: {
            //     "html": {
            //         "directory": "coverage",
            //         "subdirectory": "html",
            //         "filename": "index.html"
            //     },
            //     "lcovonly": {
            //         "directory": "coverage",
            //         "subdirectory": "lcov",
            //         "filename": "lcov.info"
            //     }
            // }
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["ChromeHeadless"],
        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--headless',
                    '--disable-gpu',
                    // Without a remote debugging port, Google Chrome exits immediately.
                    '--remote-debugging-port=9222',
                ],
            }
        },
        logLevel: config.LOG_ERROR
    });
};
