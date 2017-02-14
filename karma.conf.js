module.exports = function (config) {
    config.set({

        frameworks: ["jasmine", "fixture", "karma-typescript"],

        files: [
            { pattern: "./base.spec.ts" },

            { pattern: "./public/jquery/jquery.js" },

            { pattern: "./app/app.component.ts" },
            { pattern: "./app/interfaces/*.ts" },
            { pattern: "./app/model/*.ts" },
            { pattern: "./app/directives/*.ts" },
            { pattern: "./app/components/initiative/*.*" },
            { pattern: "./app/components/help/*.*" },
            { pattern: "./app/components/building/*.*" },
            { pattern: "./app/services/data.service.ts" },
            { pattern: "./app/services/dataset.service.ts" },
            { pattern: "./app/services/error.service.ts" },
            { pattern: "./app/services/tree.exploration.service.ts" },


            { pattern: "./test/specs/shared/**/*.ts" },
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

        karmaTypescriptConfig: {
            bundlerOptions: {
                // ignore: ["d3-ng2-service"],
                // validateSyntax: true
            },
            reports: { 
                "html": {
                    "directory": "test/coverage",
                    "subdirectory":"html",
                    "filename": "coverage.html"
                },
                "lcovonly":{
                    "directory": "test/coverage",
                    "subdirectory":"lcov",
                    "filename": "lcov.info"
                }
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["PhantomJS"]
    });
};
