# Healthcare Application Testing Guide

This document outlines the testing infrastructure, best practices, and configuration for the Healthcare Application.

## Table of Contents

1. [Test Setup](#test-setup)
2. [Running Tests](#running-tests)
3. [MongoDB Testing](#mongodb-testing)
4. [Test Optimization](#test-optimization)
5. [CI/CD Integration](#cicd-integration)
6. [Troubleshooting](#troubleshooting)

## Test Setup

### Prerequisites

- Node.js 20+
- npm 8+
- MongoDB 6.0+ (optional, as tests use mongodb-memory-server)

### Dependencies

The project uses the following testing libraries:

- **Jest**: Main test runner
- **Testing Library**: For React component testing
- **Playwright**: For E2E testing
- **mongodb-memory-server**: For MongoDB testing

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test -- --coverage

# Watch mode
npm run test:watch

# Run specific test file
npm run test:file -- path/to/file.test.js
```

### Specialized Test Commands

```bash
# Run only tests that don't require MongoDB
npm run test:no-mongo

# Run only tests that require MongoDB
npm run test:with-mongo

# Run standalone tests (no external dependencies)
npm run test:standalone

# Run optimized parallel tests
npm run test:parallel

# Run tests with MongoDB connection leak detection
npm run test:parallel -- --runInBand --detectOpenHandles

# Fix MongoDB binary issues
npm run test:fix-mongo

# Analyze test performance
npm run test:analyze-performance

# Find untested areas of code
npm run test:gaps
```

## MongoDB Testing

### MongoDB Configuration

The project uses `mongodb-memory-server` to create an in-memory MongoDB instance for tests, eliminating the need for an external MongoDB server.

Key files:

- `utils/testDbHelper.ts`: Main MongoDB testing utilities
- `mongodb.helper.js`: Legacy MongoDB helper (maintained for compatibility)
- `scripts/fix-mongodb-binaries.js`: Helper script to fix common MongoDB binary issues

### Best Practices for Database Tests

1. **Always clean up connections**:

   ```javascript
   afterAll(async () => {
     await closeTestDB();
   });
   ```

2. **Isolate test data**:

   ```javascript
   beforeEach(async () => {
     await clearTestDB();
   });
   ```

3. **Handle connection failures gracefully**:

   ```javascript
   try {
     await setupTestDB();
   } catch (error) {
     console.error("Database setup failed:", error);
     // Handle appropriately
   }
   ```

4. **Use the leak detection features**:
   ```javascript
   afterAll(async () => {
     await checkForLeaks();
   });
   ```

## Test Optimization

### Performance Improvements

1. **Parallel Test Execution**

   - Use `npm run test:parallel` for fastest execution
   - Tests are automatically categorized for optimal parallelization

2. **Memory Management**

   - Added memory leak detection
   - Optimized resource cleanup
   - Added forced garbage collection

3. **Resource Efficiency**
   - Tests use fake timers where appropriate
   - Optimized MongoDB connection handling
   - Efficient mocking of expensive operations

### Detecting Slow Tests

Run the performance analyzer to identify slow tests:

```bash
npm run test:analyze-performance
```

This will generate a report in `test-reports/performance-report.json` highlighting slow tests for optimization.

## CI/CD Integration

### GitHub Actions Configuration

The project includes a CI/CD pipeline in `.github/workflows/ci.yml` that:

1. Sets up a MongoDB service container
2. Runs linting checks
3. Executes the optimized test suite with the CI runner
4. Generates and uploads test reports and coverage data

### Running the CI Test Suite Locally

To simulate the CI environment locally:

```bash
npm run test:ci
```

This uses the `scripts/ci-test-runner.js` script which runs tests in the same sequence as the CI pipeline.

## Troubleshooting

### Common Issues

#### MongoDB Connection Failures

If tests fail due to MongoDB connection issues:

1. Run the MongoDB fix script:

   ```bash
   npm run test:fix-mongo
   ```

2. Check for lingering MongoDB processes:

   ```bash
   # Windows
   taskkill /F /IM mongod.exe

   # Linux/macOS
   pkill mongod
   ```

3. Clear the MongoDB cache:
   ```bash
   rm -rf .cache/mongodb-memory-server
   ```

#### Memory Leaks

If tests report memory leaks:

1. Look for unclosed connections in test files
2. Check for timers that aren't cleared
3. Run tests with leak detection:
   ```bash
   npm run test:parallel -- --detectLeaks --logHeapUsage
   ```

#### Flaky Tests

If tests are inconsistent:

1. Increase timeouts for problematic tests
2. Add retry logic for external API calls
3. Ensure proper cleanup between tests

#### Path Resolution Issues

If you encounter path alias (@/) resolution issues:

1. Check tsconfig.json paths configuration
2. Verify jest.config.js moduleNameMapper
3. Ensure babel.config.js has proper alias configuration

### Getting Help

For additional help:

1. Check the TEST-REPORT.md file for known issues
2. File an issue in the project repository
3. Contact the testing team
