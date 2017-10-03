module.exports = function (config) {
    config.set({

        // basePath: '',

        frameworks: ["jasmine", "fixture", "karma-typescript"],

        files: [
            { pattern: "base.spec.ts" },
            // Libraries
            { pattern: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js" },
            { pattern: "https://cdn.auth0.com/js/lock/10.8/lock.min.js" },
            // Envrionments
            { pattern: "src/environment/*.*" },
            // Application
            { pattern: "src/app/shared/**/*.*" },
            { pattern: "src/app/components/**/*.*" },
            // Specs
            { pattern: "src/test/specs/**/*.*" }

        ],

        // proxies: {
        //     "/base/src/app/": "/src/app/"
        //   },

        jsonFixturesPreprocessor: {
            variableName: '__json__'
        },

        preprocessors: {
            "**/*.ts": ["karma-typescript"],
            '**/*.json': ['json_fixtures'],
            'src/app/shared/**/*.html': ['html2js']
        },

        // html2JsPreprocessor: {
        //     processPath: function (filePath) {
        //         console.log(filePath)
        //         return filePath;
        //     }
        // },

        browserConsoleLogOptions: {
            terminal: true,
            level: ""
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                transforms: [
                    require("karma-typescript-angular2-transform"),
                    require("karma-typescript-es6-transform")()

                ]
            },
            coverageOptions: {
                exclude: [/(\/src\/test\/.*|\.d|base.spec|\.spec)\.ts/i]
            },
            reports: {
                "html": {
                    "directory": "coverage",
                    "subdirectory": "html",
                    "filename": "index.html"
                },
                "lcovonly": {
                    "directory": "coverage",
                    "subdirectory": "lcov",
                    "filename": "lcov.info"
                }
            }
        },

        // logLevel: config.LOG_DEBUG,

        reporters: ["progress", "karma-typescript"],

        browsers: ["PhantomJS"]
    });
};
