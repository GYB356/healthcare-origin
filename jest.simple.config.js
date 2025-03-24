/**
 * Simple Jest configuration that skips MongoDB and other dependencies
 * Use this for basic unit tests only
 */

module.exports = {
  testEnvironment: "jsdom",
  testMatch: [
    "example.test.js",
    "example-react.test.js",
    "**/__tests__/unit/**/*.test.js?(x)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleNameMapper: {
    "^@/(.*)$": ["<rootDir>/src/$1", "<rootDir>/$1", "<rootDir>/frontend/$1"],
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/setup-tests.js"],
  collectCoverage: false,
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/mongodb\\.test\\.js$/",
    "/mongo-.*\\.test\\.js$/",
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!(mongodb-memory-server|mongodb-memory-server-core)/)"
  ],
  maxWorkers: "50%",
  bail: 1,
  verbose: true,
  clearMocks: true,
  restoreMocks: true
}; 