/**
 * Jest configuration for standalone tests that don't require MongoDB
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/standalone.test.js'
  ],
  setupFilesAfterEnv: [], // No setup files
  testTimeout: 5000,
  verbose: true
}; 