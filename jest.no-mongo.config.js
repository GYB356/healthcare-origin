/**
 * Jest configuration that skips MongoDB setup
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/example.test.js", "**/standalone.test.js"],
  setupFilesAfterEnv: [
    "./jest.setup.js", // Use our regular setup but will skip MongoDB
  ],
  testTimeout: 10000,
  verbose: true,
  // Set environment variables for the test runner
  testEnvironmentOptions: {
    url: "http://localhost",
    // Add environment variables here
    env: {
      SKIP_MONGO: "true",
    },
  },
  // Set global variables to be used within tests
  globals: {
    SKIP_MONGO: true,
  },
};
