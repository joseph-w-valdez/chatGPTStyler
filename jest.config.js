module.exports = {
    clearMocks: true,
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
    moduleNameMapper: {
        "@src/(.*)": "<rootDir>/src/$1",
        "webextension-polyfill":
            "<rootDir>/src/__mocks__/webextension-polyfill.ts",
        "\\.(css|less|scss|sss|styl)$":
            "<rootDir>/node_modules/jest-css-modules",
    },
    roots: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    testPathIgnorePatterns: ["/node_modules/"],
    transform: {
        "\\.tsx?$": "ts-jest",
    },
};
