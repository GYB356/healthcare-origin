/**
 * Jest configuration that skips MongoDB setup
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/example.test.js',
    '**/standalone.test.js'
  ],
  setupFilesAfterEnv: [
    './jest.setup.js' // Use our regular setup but will skip MongoDB
  ],
  testTimeout: 10000,
  verbose: true,
  // Set environment variables for the test runner
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  // Skip MongoDB for all tests run with this config
  testEnvironmentVariables: {
    SKIP_MONGO: 'true'
  }
}; 