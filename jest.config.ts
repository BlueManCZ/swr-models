export default {
    preset: "ts-jest",
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["/dist/"],
};
