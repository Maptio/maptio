module.exports = function (config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "./base.spec.ts" },
            
            {pattern: "./public/jquery/jquery.js"},

{ pattern: "./app/interfaces/*.ts" },
            
            { pattern: "./app/model/*.ts" },
            { pattern: "./app/directives/*.ts" },
             { pattern: "./app/components/initiative/*.*" },
              { pattern: "./app/components/help/*.*" },
            
             { pattern: "./app/services/data.service.ts" },
             { pattern: "./app/services/dataset.service.ts" },
             { pattern: "./app/services/error.service.ts" },
             // { pattern: "./app/services/ui.service.ts" },
             { pattern: "./app/services/tree.exploration.service.ts" },
            //{ pattern: "./app/services/color.service.ts" },
            //{ pattern: "./app/services/ui.service.ts" },
             { pattern: "./test/specs/shared/**/*.ts" },
            { pattern: "./test/specs/model/*.ts" },
             { pattern: "./test/specs/directives/*.ts" },
             { pattern: "./test/specs/components/**/*.ts" },
            { pattern: "./test/specs/services/*.ts" }
        ],

        proxies: {
            "/app/": "/base/app/"
            //"/app/": "/base/src/app/" // use this without moduleId + templateUrl: "app/hello.html"
        },



        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                // ignore: ["d3-ng2-service"],
                // validateSyntax: true
                
            },

            reports: {
                "html": {
                    "directory": "test/coverage",
                    "filename": "coverage.html"
                }
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
