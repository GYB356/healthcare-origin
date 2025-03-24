/**
 * Jest configuration for standalone tests
 * These tests don't require MongoDB or other external dependencies
 */

module.exports = {
  testEnvironment: "jsdom",
  testMatch: [
    "example.test.js",
    "standalone.test.js",
    "**/__tests__/unit/**/*.test.js?(x)",
    "**/__tests__/unit/**/*.spec.js?(x)",
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
  setupFilesAfterEnv: ["./jest.setup.js"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
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
