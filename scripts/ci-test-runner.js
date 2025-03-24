/**
 * CI/CD Test Runner
 *
 * This script runs all tests in the optimal order for CI/CD environments
 * and ensures proper cleanup between test suites.
 * Supports both Docker and local environments.
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Load environment variables
require("dotenv").config({ path: ".env.test" });

// Configuration
const MAX_RETRIES = parseInt(process.env.TEST_RETRIES || "2");
const TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT || "600000"); // 10 minutes
const CI_WORKERS = process.env.TEST_PARALLEL_WORKERS || "50%";
const COVERAGE_THRESHOLD = parseInt(process.env.TEST_COVERAGE_THRESHOLD || "80");

// Detect environment
const IS_DOCKER = fs.existsSync("/.dockerenv") || process.env.RUNNING_IN_DOCKER === "true";
const IS_CI = process.env.CI === "true";

console.log(`
=================================================
CI/CD Test Runner
=================================================
Environment:
- Running in Docker: ${IS_DOCKER}
- Running in CI: ${IS_CI}
- Maximum retries: ${MAX_RETRIES}
- Test timeout: ${TEST_TIMEOUT}ms
- Worker threads: ${CI_WORKERS}
- Coverage threshold: ${COVERAGE_THRESHOLD}%
- Using real MongoDB: ${process.env.USE_REAL_MONGODB === "true"}
=================================================
`);

// Helper function to run a command with timeout
function runCommandWithTimeout(command, args, options = {}, timeout = TEST_TIMEOUT) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command} ${args.join(" ")}`);

    // Start the child process
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    // Set up timeout
    const timeoutId = setTimeout(() => {
      console.error(`Command timed out after ${timeout}ms`);
      child.kill("SIGTERM");
      setTimeout(() => {
        // Force kill if still running
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, 5000);
      reject(new Error("Command timed out"));
    }, timeout);

    // Handle process exit
    child.on("close", (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        resolve({ code, success: true });
      } else {
        resolve({ code, success: false });
      }
    });

    // Handle process errors
    child.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

// Run tests with retries
async function runTestWithRetry(testCommand, args = [], maxRetries = MAX_RETRIES) {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const result = await runCommandWithTimeout("npm", [
        "run",
        testCommand,
        "--",
        ...(Array.isArray(args) ? args : []),
      ]);

      if (result.success) {
        return true;
      }

      console.error(
        `Test failed with exit code ${result.code}, retry ${retries + 1}/${maxRetries + 1}`,
      );
      retries++;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error running test: ${error.message}`);
      retries++;

      if (retries > maxRetries) {
        throw error;
      }

      // Wait longer before retrying after an error
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return false;
}

// Check MongoDB availability
async function checkMongoDBAvailability() {
  if (process.env.USE_REAL_MONGODB !== "true") {
    console.log("Using in-memory MongoDB, skipping availability check");
    return true;
  }

  try {
    console.log("Checking MongoDB availability...");
    const mongoose = require("mongoose");
    const mongoUri = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/healthcare-test";

    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB is available");
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error(`❌ MongoDB is not available: ${error.message}`);

    if (IS_DOCKER || IS_CI) {
      console.log("Waiting for MongoDB to become available (30s)...");
      await new Promise((resolve) => setTimeout(resolve, 30000));
      return checkMongoDBAvailability();
    }

    return false;
  }
}

// Main execution function
async function runCiTests() {
  try {
    console.log("========================================");
    console.log("Starting CI/CD Test Suite");
    console.log("========================================");

    // Check MongoDB availability if using real database
    if (process.env.USE_REAL_MONGODB === "true") {
      const mongoAvailable = await checkMongoDBAvailability();
      if (!mongoAvailable) {
        console.error("MongoDB is not available, cannot proceed with tests");
        process.exit(1);
      }
    } else {
      // Step 1: Fix MongoDB binaries for in-memory database
      console.log("\n--- Ensuring MongoDB binaries are available ---");
      await runCommandWithTimeout("npm", ["run", "test:fix-mongo"]);
    }

    // Step 2: Clear cache
    console.log("\n--- Clearing Jest cache ---");
    await runCommandWithTimeout("npm", ["run", "test:clean-cache"]);

    // Step 3: Run standalone tests first (no DB dependency)
    console.log("\n--- Running standalone tests ---");
    const standaloneSuccess = await runTestWithRetry("test:standalone");

    if (!standaloneSuccess) {
      console.error("Standalone tests failed after retries");
      process.exit(1);
    }

    // Step 4: Run non-MongoDB tests
    console.log("\n--- Running tests without MongoDB ---");
    const noMongoSuccess = await runTestWithRetry("test:no-mongo");

    if (!noMongoSuccess) {
      console.error("No-Mongo tests failed after retries");
      process.exit(1);
    }

    // Step 5: Run MongoDB tests with leak detection
    console.log("\n--- Running tests with MongoDB and leak detection ---");
    const mongoTestSuccess = await runTestWithRetry("test:parallel", [
      "--detectOpenHandles",
      `--maxWorkers=${CI_WORKERS}`,
    ]);

    if (!mongoTestSuccess) {
      console.error("MongoDB tests failed after retries");
      process.exit(1);
    }

    // Step 6: Run tests with coverage
    console.log("\n--- Running tests with coverage ---");
    const coverageArgs = [
      "--coverage",
      "--coverageThreshold",
      `{"global":{"branches":${COVERAGE_THRESHOLD},"functions":${COVERAGE_THRESHOLD},"lines":${COVERAGE_THRESHOLD},"statements":${COVERAGE_THRESHOLD}}}`,
    ];

    const coverageSuccess = await runTestWithRetry("test", coverageArgs);

    if (!coverageSuccess) {
      console.error("Coverage tests failed");
      process.exit(1);
    }

    // Step 7: Check performance of slow tests
    console.log("\n--- Analyzing test performance ---");
    await runCommandWithTimeout("npm", ["run", "test:analyze-performance"]);

    // All tests passed
    console.log("\n========================================");
    console.log("All tests passed successfully!");
    console.log("========================================");

    process.exit(0);
  } catch (error) {
    console.error(`CI test run failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runCiTests();
