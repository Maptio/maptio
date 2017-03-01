module.exports = function (config) {
    config.set({

        frameworks: ["jasmine", "fixture", "karma-typescript"],

        files: [


            { pattern: "./base.spec.ts" },

            { pattern: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js" },
            { pattern: "https://cdn.auth0.com/js/lock/10.8/lock.min.js" },

            { pattern: "./src/app/app.component.ts" },
            { pattern: "./src/app/shared/interfaces/*.ts" },
            { pattern: "./src/app/shared/model/*.ts" },
            { pattern: "./src/app/shared/directives/*.ts" },
            { pattern: "./src/app/components/initiative/*.*" },
            { pattern: "./src/app/components/help/*.*" },
            { pattern: "./src/app/components/building/*.*" },
            //{ pattern: "./app/components/mapping/**/*.*" },
            { pattern: "./src/app/shared/services/data.service.ts" },
            { pattern: "./src/app/shared/services/dataset.service.ts" },
            { pattern: "./src/app/shared/services/error.service.ts" },
            { pattern: "./src/app/shared/services/auth.service.ts" },

            
             { pattern: "./src/test/specs/**/*.*" }
        ],

        proxies: {
            "/app/": "/base/src/app/"
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
                    "directory": "coverage",
                    "filename": "html/index.html"
                },
                "lcovonly": {
                    "directory": "coverage",
                    "filename": "lcov/lcov.info"
                }
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["PhantomJS"]
    });
};
