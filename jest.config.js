module.exports = {
    preset: "jest-preset-angular",
    testMatch: [
        "<rootDir>/src/**/*.spec.ts"
    ],
    setupFilesAfterEnv: [
        "<rootDir>/setupJest.ts"
    ],

    transformIgnorePatterns: [
        "node_modules/(?!lodash-es|lodash|ngx-fullstory)"
    ],
    moduleNameMapper: {
        "^lodash-es$": "lodash"
    },
    coverageReporters: ["html", "text-summary", "lcov"],
    collectCoverageFrom: [
        "<rootDir>/src/app/**/*.ts"
    ]
};

