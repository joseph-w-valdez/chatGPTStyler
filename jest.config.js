module.exports = {
    clearMocks: true,
    testEnvironment: "jsdom",
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
    moduleNameMapper: {
        "@src/(.*)": "<rootDir>/src/$1",
        "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
    },
    roots: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    testPathIgnorePatterns: ["/node_modules/"],
    transform: {
        "\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.json",
            },
        ],
    },
};
