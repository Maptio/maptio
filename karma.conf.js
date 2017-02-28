module.exports = function (config) {
    config.set({

        frameworks: ["jasmine", "fixture", "karma-typescript"],

        files: [


            { pattern: "./base.spec.ts" },

            { pattern: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js" },
            { pattern: "https://cdn.auth0.com/js/lock/10.8/lock.min.js" },

            { pattern: "./app/app.component.ts" },
            { pattern: "./app/shared/interfaces/*.ts" },
            { pattern: "./app/shared/model/*.ts" },
            { pattern: "./app/shared/directives/*.ts" },
            { pattern: "./app/components/initiative/*.*" },
            { pattern: "./app/components/help/*.*" },
            { pattern: "./app/components/building/*.*" },
            //{ pattern: "./app/components/mapping/**/*.*" },
            { pattern: "./app/shared/services/data.service.ts" },
            { pattern: "./app/shared/services/dataset.service.ts" },
            { pattern: "./app/shared/services/error.service.ts" },
            { pattern: "./app/shared/services/auth.service.ts" },

            
             { pattern: "./test/specs/shared/*.ts" },
            { pattern: "./test/specs/model/*.ts" },
            { pattern: "./test/specs/directives/*.ts" },
            { pattern: "./test/specs/components/**/*.*" },
            { pattern: "./test/specs/services/*.ts" }
        ],

        proxies: {
            "/app/": "/base/app/"
            //"/app/": "/base/src/app/" // use this without moduleId + templateUrl: "app/hello.html"
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
                // ignore: ["d3-ng2-service"],
                validateSyntax: false
            },
            reports: {
                "html": {
                    "directory": "test/coverage",
                    "subdirectory": "html",
                    "filename": "coverage.html"
                },
                "lcovonly": {
                    "directory": "test/coverage",
                    "subdirectory": "lcov",
                    "filename": "lcov.info"
                }
            },
            coverageOptions: {
                instrumentation:false, 
                exclude:  /\.shared\.ts/i
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["PhantomJS"]
    });
};
