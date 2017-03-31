module.exports = function (config) {
    config.set({

        frameworks: ["jasmine", "fixture", "karma-typescript"],

        files: [
            { pattern: "./base.spec.ts" },
            // Libraries
            { pattern: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js" },
            { pattern: "https://cdn.auth0.com/js/lock/10.8/lock.min.js" },
            // Application
            //{ pattern: "./src/app/app.component.ts" },
            { pattern: "./src/app/shared/**/*.*" },
            { pattern: "./src/app/components/**/*.*" },
            // Specs
            { pattern: "./src/test/specs/**/*.*" }
        ],

        proxies: {
            "/app/": "/base/src/app/"
        },

        jsonFixturesPreprocessor: {
            variableName: '__json__'
        },

        preprocessors: {
            "**/*.ts": ["karma-typescript"],
            '**/*.html': ['html2js'],
            '**/*.json': ['json_fixtures']
        },

        browserConsoleLogOptions: {
            terminal: true,
            level: ""
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                transforms: [
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

        reporters: ["progress", "karma-typescript"],

        browsers: ["PhantomJS"]
    });
};
