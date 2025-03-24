/**
 * Optimized Jest configuration
 * This configuration improves test performance by:
 * 1. Using parallel test execution where possible
 * 2. Setting appropriate timeouts and memory limits
 * 3. Optimizing the test environment setup
 * 4. Using more efficient module resolution
 */
module.exports = {
  // Extends the base config
  preset: "./jest.config.js",

  // Performance optimizations
  maxWorkers: "70%", // Use 70% of available cores
  maxConcurrency: 10, // Maximum number of tests running concurrently

  // Optimized test detection
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/__tests__/**/*.spec.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  // Optimize transformations
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        // Use faster babel configuration
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
        plugins: ["@babel/plugin-transform-runtime"],
      },
    ],
  },

  // Improved caching
  cache: true,
  cacheDirectory: ".jest-cache",

  // Faster snapshot processing
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: false,
  },

  // Memory management
  globals: {
    "ts-jest": {
      isolatedModules: true, // Improves performance
    },
    NODE_OPTIONS: "--max-old-space-size=4096", // Increase memory limit
  },

  // Diagnostics
  logHeapUsage: true, // Monitor memory usage
  detectLeaks: true, // Detect memory leaks
  detectOpenHandles: true, // Help identify unfinished async operations

  // Reporting optimizations
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-reports",
        outputName: "junit.xml",
      },
    ],
  ],

  // Error handling
  bail: 5, // Stop after 5 failures

  // Resource cleanup
  testTimeout: 30000, // 30 second timeout
  setupFilesAfterEnv: ["./jest.setup.js", "./jest.performance.setup.js"],

  // Faster module resolution
  moduleDirectories: ["node_modules", "<rootDir>"],

  // More precise transformation ignores
  transformIgnorePatterns: [
    "/node_modules/(?!(mongodb-memory-server|mongodb-memory-server-core|express|socket.io|@playwright/test|@chakra-ui|next)/)",
  ],

  // Faster test runs by focusing types
  watchPathIgnorePatterns: ["node_modules", ".git", "coverage", ".next", "dist", "build"],
};
