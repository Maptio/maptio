module.exports = function (config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "./base.spec.ts" },
            { pattern: "./app/model/*.ts" },
            { pattern: "./app/services/data.service.ts" },
            { pattern: "./app/services/dataset.service.ts" },
            { pattern: "./app/services/error.service.ts" },
            { pattern: "./app/services/tree.exploration.service.ts" }
            //{ pattern: "./app/services/color.service.ts" },
            //{ pattern: "./app/services/ui.service.ts" }
        ],

        proxies: {
            "/app/": "/base/app/"
            //"/app/": "/base/src/app/" // use this without moduleId + templateUrl: "app/hello.html"
        },



        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            reports: {

                "html": {
                    "directory": "test/coverage",
                    "filename": "coverage.html"
                },
                "text": ""
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
