/**
 * Optimized test runner script with better parallelization and categorization
 */
const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const util = require("util");

const execPromise = util.promisify(exec);

// Define command line arguments
const args = process.argv.slice(2);
const mode = args[0] || "all"; // Options: 'all', 'fast', 'component', 'api', 'unit', 'integration', 'file'
const target = args[1]; // Optional specific file or pattern to test

// Test categories for better organization and parallelization
const TEST_CATEGORIES = {
  COMPONENT: ["**/components/**/*.test.{js,jsx,ts,tsx}"],
  API: ["**/api/**/*.test.{js,jsx,ts,tsx}", "**/services/**/*.test.{js,jsx,ts,tsx}"],
  UNIT: ["**/unit/**/*.test.{js,jsx,ts,tsx}", "**/utils/**/*.test.{js,jsx,ts,tsx}"],
  INTEGRATION: ["**/integration/**/*.test.{js,jsx,ts,tsx}"],
  STANDALONE: ["./standalone.test.js", "./example.test.js"],
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Helper function to run commands
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}Running command:${colors.reset} ${command} ${args.join(" ")}`);

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

// Check if MongoDB is needed for the tests
async function checkIfMongoDBNeeded(testPattern) {
  try {
    // Look for imports of mongoose or mongodb in the test files
    const { stdout } = await execPromise(
      `grep -r --include="*.test.{js,jsx,ts,tsx}" "require.*mongoose\\|import.*mongoose\\|require.*mongodb\\|import.*mongodb" ${testPattern}`,
    );
    return stdout.trim() !== "";
  } catch (error) {
    // grep returns non-zero exit code if no matches found
    return false;
  }
}

// Run tests in a specific category
async function runTestCategory(category, needsMongo = false) {
  const patterns = TEST_CATEGORIES[category];
  if (!patterns || patterns.length === 0) {
    console.log(
      `${colors.yellow}No test patterns defined for category:${colors.reset} ${category}`,
    );
    return;
  }

  console.log(`${colors.magenta}Running ${category} tests${colors.reset}`);

  // Determine the appropriate Jest config based on MongoDB requirement
  const configFile = needsMongo ? "jest.config.js" : "jest.no-mongo.config.js";

  // Build the Jest command
  const jestArgs = [
    "--config",
    configFile,
    "--forceExit",
    "--bail=5",
    "--maxWorkers=50%",
    ...patterns,
  ];

  try {
    await runCommand("jest", jestArgs);
    console.log(`${colors.green}✓ ${category} tests completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ ${category} tests failed:${colors.reset}`, error.message);
    return false;
  }
}

// Run tests for a specific file
async function runTestFile(filePath) {
  const needsMongo = await checkIfMongoDBNeeded(filePath);
  const configFile = needsMongo ? "jest.config.js" : "jest.no-mongo.config.js";

  console.log(`${colors.cyan}Running tests for file:${colors.reset} ${filePath}`);
  console.log(`${colors.cyan}Using config:${colors.reset} ${configFile}`);

  const jestArgs = ["--config", configFile, "--forceExit", filePath];

  try {
    await runCommand("jest", jestArgs);
    console.log(`${colors.green}✓ Tests for ${filePath} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Tests for ${filePath} failed:${colors.reset}`, error.message);
    return false;
  }
}

// Fast mode - run standalone tests that don't need MongoDB
async function runFastTests() {
  console.log(`${colors.cyan}Running fast tests (no MongoDB)${colors.reset}`);

  const jestArgs = ["--config", "jest.standalone.config.js", "--forceExit", "--bail=5"];

  try {
    await runCommand("jest", jestArgs);
    console.log(`${colors.green}✓ Fast tests completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Fast tests failed:${colors.reset}`, error.message);
    return false;
  }
}

// Run all tests in an optimized order
async function runAllTests() {
  // Start with standalone tests that don't need MongoDB
  const results = [];

  console.log(`${colors.magenta}Running all tests in optimized order${colors.reset}`);

  // Run standalone tests first (fast, no MongoDB needed)
  results.push(await runFastTests());

  // Run Unit tests (mostly don't need MongoDB)
  results.push(await runTestCategory("UNIT", false));

  // Run Component tests (some may need MongoDB)
  results.push(await runTestCategory("COMPONENT", true));

  // Run API tests (likely need MongoDB)
  results.push(await runTestCategory("API", true));

  // Run Integration tests last (most complex, likely need MongoDB)
  results.push(await runTestCategory("INTEGRATION", true));

  // Report summary
  const successful = results.filter(Boolean).length;
  const failed = results.length - successful;

  console.log("\n---------------------------------");
  console.log(`${colors.magenta}Test Execution Summary${colors.reset}`);
  console.log("---------------------------------");
  console.log(`Total categories: ${results.length}`);
  console.log(`${colors.green}Successful: ${successful}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log("---------------------------------\n");

  return failed === 0;
}

// Main execution flow
async function main() {
  try {
    let success = false;

    // Execute based on the requested mode
    switch (mode) {
      case "fast":
        success = await runFastTests();
        break;

      case "component":
        success = await runTestCategory("COMPONENT", true);
        break;

      case "api":
        success = await runTestCategory("API", true);
        break;

      case "unit":
        success = await runTestCategory("UNIT", false);
        break;

      case "integration":
        success = await runTestCategory("INTEGRATION", true);
        break;

      case "file":
        if (!target) {
          console.error(`${colors.red}Error: No test file specified.${colors.reset}`);
          console.error(`Usage: node optimize-tests.js file <path-to-test-file>`);
          process.exit(1);
        }
        success = await runTestFile(target);
        break;

      case "all":
      default:
        success = await runAllTests();
        break;
    }

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
