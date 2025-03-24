# Healthcare Application Test Infrastructure Guide

This document provides a comprehensive guide to the test infrastructure for the Healthcare Application, focusing on the recent optimizations and improvements that make the test suite production-ready.

## Table of Contents

1. [Test Environment Options](#test-environment-options)
2. [Running Tests](#running-tests)
3. [Real MongoDB vs. In-Memory MongoDB](#real-mongodb-vs-in-memory-mongodb)
4. [Docker-Based Testing](#docker-based-testing)
5. [Test Performance Optimization](#test-performance-optimization)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

## Test Environment Options

The test infrastructure now supports three testing environments:

1. **Local Environment with In-Memory MongoDB**

   - Uses `mongodb-memory-server` for an isolated, ephemeral MongoDB instance
   - Ideal for quick, isolated unit tests
   - No need for a local MongoDB installation

2. **Local Environment with Real MongoDB**

   - Connects to a real MongoDB instance running locally
   - Better for integration tests and performance testing
   - Requires MongoDB to be installed and running

3. **Docker Environment**
   - Runs tests in a containerized environment with its own MongoDB service
   - Ensures consistent test environment across different machines
   - Mirrors production-like conditions

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests with real MongoDB
npm run test:real-mongo

# Run tests with in-memory MongoDB
npm run test:in-memory

# Run tests in Docker
npm run test:docker
```

### Specialized Test Commands

```bash
# Run standalone tests (no MongoDB dependency)
npm run test:standalone

# Run non-MongoDB tests
npm run test:no-mongo

# Run MongoDB-dependent tests
npm run test:with-mongo

# Run optimized parallel tests
npm run test:parallel

# Analyze test performance and get optimization recommendations
npm run test:analyze-performance
```

## Real MongoDB vs. In-Memory MongoDB

The test infrastructure now supports both real MongoDB and in-memory MongoDB testing:

### In-Memory MongoDB

- **Configuration**: Set `USE_REAL_MONGODB=false` in your `.env.test` file
- **Benefits**:
  - Isolated test environment
  - No external dependencies
  - Faster for CI/CD pipeline
- **Drawbacks**:
  - Less realistic than a real MongoDB instance
  - May not catch all MongoDB-specific issues

### Real MongoDB

- **Configuration**: Set `USE_REAL_MONGODB=true` in your `.env.test` file
- **Benefits**:
  - More realistic testing environment
  - Tests real MongoDB behavior and performance
  - Better for integration tests
- **Drawbacks**:
  - Requires a MongoDB installation
  - Tests may be slower
  - Tests are not completely isolated

### Switching Between Modes

You can switch between real and in-memory MongoDB by:

1. Modifying the `.env.test` file
2. Using the appropriate npm script:
   - `npm run test:real-mongo` for real MongoDB
   - `npm run test:in-memory` for in-memory MongoDB

## Docker-Based Testing

Docker-based testing provides a consistent environment for running tests:

### Running Tests in Docker

```bash
# Start the Docker environment and run tests
npm run test:docker

# Clean up Docker environment after tests
npm run test:docker:clean
```

### Docker Environment Configuration

The Docker test environment is defined in `docker-compose.test.yml` and includes:

- **MongoDB Service**: MongoDB 6.0.4 container with health checks
- **Application Service**: Node.js application container for test execution
- **Shared Volumes**: Volumes for test results, code, and node_modules

### Benefits of Docker Testing

- Consistent environment across different machines
- No need to install MongoDB locally
- Isolated from the host system
- Mirrors production-like conditions

## Test Performance Optimization

The test infrastructure includes tools for identifying and optimizing slow tests:

### Analyzing Test Performance

```bash
# Analyze test performance and get optimization recommendations
npm run test:analyze-performance
```

This will:

1. Run tests and collect timing data
2. Identify the slowest tests
3. Analyze slow tests for common performance issues
4. Provide recommendations for optimization
5. Generate a detailed performance report

### Common Test Performance Issues

1. **Multiple Database Queries**: Use batched queries or mocks
2. **Real Timers**: Use `jest.useFakeTimers()` for tests with timeouts
3. **Large Data Sets**: Reduce the size of test data
4. **Too Many Assertions**: Split into multiple smaller tests
5. **Unnecessary Database Clearing**: Group tests that can share database state

## CI/CD Integration

The test infrastructure is optimized for CI/CD environments:

### GitHub Actions Integration

The CI/CD pipeline in `.github/workflows/ci.yml` includes:

1. **Node.js Test Job**: Runs tests with a real MongoDB service
2. **Docker Test Job**: Runs tests in a Docker environment
3. **Deploy Job**: Deploys the application if all tests pass

### CI Test Runner

The CI test runner in `scripts/ci-test-runner.js`:

1. Detects the environment (Docker, CI, local)
2. Checks MongoDB availability
3. Runs tests in optimized order:
   - Standalone tests first
   - Non-MongoDB tests next
   - MongoDB tests with leak detection
   - Coverage tests last
4. Provides detailed reporting
5. Handles retries for flaky tests

## Troubleshooting

### Common Issues

#### MongoDB Connection Issues

```bash
# Fix MongoDB binary issues
npm run test:fix-mongo

# Clear MongoDB caches
rm -rf ./.cache/mongodb-memory-server

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

#### Test Timeouts

Increase test timeouts in `.env.test`:

```
TEST_TIMEOUT=60000
```

#### Memory Leaks

Run tests with leak detection:

```bash
npm run test:parallel -- --detectOpenHandles --detectLeaks
```

#### Test Cache Issues

Clear the Jest cache:

```bash
npm run test:clean-cache
```

### Getting Help

If you encounter issues with the test infrastructure:

1. Check the `TEST-REPORT-UPDATED.md` for known issues and recommendations
2. Review the `.env.test` configuration
3. Check MongoDB logs if using a real MongoDB instance
4. Look for errors in the CI/CD pipeline logs

## Conclusion

This enhanced test infrastructure provides a robust, flexible, and optimized environment for testing the Healthcare Application. By supporting both real and in-memory MongoDB, Docker-based testing, and performance optimization, we've created a production-ready test suite that ensures quality and stability across all environments.
