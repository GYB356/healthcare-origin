/**
 * Custom test runner script with better error handling and MongoDB setup
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Define command line arguments
const args = process.argv.slice(2);
const testType = args[0] || "all"; // Options: 'all', 'with-mongo', 'no-mongo', 'standalone'
const testFile = args[1]; // Optional specific test file to run

// Helper function to run commands
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command} ${args.join(" ")}`);

    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

// Ensure MongoDB binary is downloaded
async function ensureMongoDBBinary() {
  if (testType === "no-mongo" || testType === "standalone") {
    console.log("Skipping MongoDB binary download for non-MongoDB tests");
    return;
  }

  try {
    await runCommand("node", ["scripts/download-mongodb-binary.js"]);
  } catch (error) {
    console.error("Failed to download MongoDB binary:", error);
    process.exit(1);
  }
}

// Run tests based on type
async function runTests() {
  try {
    // Determine the Jest config file based on test type
    let configFile;
    switch (testType) {
      case "with-mongo":
        configFile = "jest.config.js";
        console.log("Running tests with MongoDB...");
        break;

      case "no-mongo":
        configFile = "jest.no-mongo.config.js";
        console.log("Running tests without MongoDB...");
        break;

      case "standalone":
        configFile = "jest.standalone.config.js";
        console.log("Running standalone tests...");
        break;

      case "unit":
        configFile = "jest.config.js";
        console.log("Running unit tests...");
        break;

      case "integration":
        configFile = "jest.config.js";
        console.log("Running integration tests...");
        break;

      case "all":
      default:
        // Run all tests in sequence
        console.log("Running all tests in sequence...");

        console.log("\n===== STANDALONE TESTS =====\n");
        await runCommand("jest", ["--config", "jest.standalone.config.js", "--forceExit"]);

        console.log("\n===== NO-MONGO TESTS =====\n");
        await runCommand("jest", ["--config", "jest.no-mongo.config.js", "--forceExit"]);

        console.log("\n===== WITH-MONGO TESTS =====\n");
        await runCommand("jest", ["--config", "jest.config.js", "--forceExit"]);

        console.log("All tests completed successfully!");
        return;
    }

    // Build the command arguments
    const jestArgs = ["--config", configFile];

    // Add test file pattern if specified
    if (testFile) {
      jestArgs.push(testFile);
    }

    // Add common flags
    jestArgs.push("--forceExit");

    // Add bail flag to stop after 5 failures
    jestArgs.push("--bail=5");

    // Add other helpful flags
    if (process.env.CI) {
      jestArgs.push("--ci");
      jestArgs.push("--maxWorkers=2"); // Limit concurrency in CI
    } else {
      jestArgs.push("--maxWorkers=50%"); // Use 50% of available CPUs
    }

    // Run the tests
    await runCommand("jest", jestArgs);
    console.log("Tests completed successfully!");
  } catch (error) {
    console.error("Test run failed:", error);
    process.exit(1);
  }
}

// Main execution flow
async function main() {
  try {
    await ensureMongoDBBinary();
    await runTests();
  } catch (error) {
    console.error("Error running tests:", error);
    process.exit(1);
  }
}

main();
