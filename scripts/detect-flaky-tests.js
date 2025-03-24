/**
 * Flaky Tests Detection Tool
 *
 * This script runs tests multiple times to identify flaky tests
 * that pass or fail inconsistently across runs.
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Configuration
const ITERATIONS = 5; // Number of times to run each test
const TEST_REPORT_DIR = "./test-reports";
const FLAKY_REPORT_PATH = path.join(TEST_REPORT_DIR, "flaky-tests-report.json");
const TEMP_RESULTS_DIR = path.join(TEST_REPORT_DIR, "flaky-test-runs");

/**
 * Run a Jest command and return the results
 */
function runJestCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running Jest with args: ${args.join(" ")}`);

    const jest = spawn("npx", ["jest", ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    jest.stdout.on("data", (data) => {
      stdout += data;
    });

    jest.stderr.on("data", (data) => {
      stderr += data;
    });

    jest.on("close", (code) => {
      resolve({
        code,
        stdout,
        stderr,
      });
    });

    jest.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Run a specific test file multiple times and save the results
 */
async function runTestFileMultipleTimes(testFile, iterations = ITERATIONS) {
  console.log(`\n📋 Running ${testFile} ${iterations} times to check for flakiness`);

  const results = [];

  for (let i = 0; i < iterations; i++) {
    console.log(`\n➡️ Run ${i + 1}/${iterations}`);

    try {
      // Run the test with JSON output
      const outputFile = path.join(TEMP_RESULTS_DIR, `${path.basename(testFile)}_run${i + 1}.json`);

      const result = await runJestCommand([
        "--config=jest.optimized.config.js",
        "--no-cache",
        "--json",
        `--outputFile=${outputFile}`,
        testFile,
      ]);

      results.push({
        run: i + 1,
        exitCode: result.code,
        outputFile,
      });

      console.log(`Run ${i + 1} completed with exit code ${result.code}`);
    } catch (error) {
      console.error(`Error in run ${i + 1}:`, error);
      results.push({
        run: i + 1,
        exitCode: 1,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Parse the results of a test run from the JSON output
 */
function parseTestRunResult(outputFile) {
  try {
    const data = fs.readFileSync(outputFile, "utf8");
    const results = JSON.parse(data);

    // Extract test results
    const testResults = [];

    results.testResults.forEach((fileResult) => {
      fileResult.testResults.forEach((testResult) => {
        testResults.push({
          name: testResult.fullName || testResult.title,
          status: testResult.status,
          duration: testResult.duration,
        });
      });
    });

    return {
      success: results.success,
      testResults,
    };
  } catch (error) {
    console.error(`Error parsing result file ${outputFile}:`, error);
    return {
      success: false,
      testResults: [],
      error: error.message,
    };
  }
}

/**
 * Analyze the results to identify flaky tests
 */
function identifyFlakyTests(testFile, runResults) {
  const testOutcomes = {};

  // Process each run
  runResults.forEach((run) => {
    if (run.exitCode !== 0) {
      // Skip runs that completely failed
      return;
    }

    try {
      const parsedResults = parseTestRunResult(run.outputFile);

      parsedResults.testResults.forEach((result) => {
        if (!testOutcomes[result.name]) {
          testOutcomes[result.name] = {
            name: result.name,
            results: [],
          };
        }

        testOutcomes[result.name].results.push({
          run: run.run,
          status: result.status,
          duration: result.duration,
        });
      });
    } catch (error) {
      console.error(`Error processing run ${run.run}:`, error);
    }
  });

  // Identify flaky tests
  const flakyTests = [];

  Object.values(testOutcomes).forEach((testOutcome) => {
    const statuses = testOutcome.results.map((r) => r.status);
    const uniqueStatuses = new Set(statuses);

    // A test is flaky if it has different results across runs
    if (uniqueStatuses.size > 1) {
      const passingRuns = statuses.filter((s) => s === "passed").length;
      const failingRuns = statuses.filter((s) => s === "failed").length;

      flakyTests.push({
        name: testOutcome.name,
        file: testFile,
        totalRuns: testOutcome.results.length,
        passingRuns,
        failingRuns,
        flakinessRate: (Math.min(passingRuns, failingRuns) / testOutcome.results.length) * 100,
      });
    }
  });

  return flakyTests;
}

/**
 * Get all test files to be analyzed
 */
function getTestFiles() {
  try {
    // This is a simplified version, you might want to use glob or similar
    // to do more sophisticated test file selection
    const testFiles = [];
    const testDirs = ["__tests__", "src/__tests__", "components/__tests__"];

    testDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir, { withFileTypes: true })
          .filter(
            (entry) =>
              entry.isFile() &&
              (entry.name.endsWith(".test.js") || entry.name.endsWith(".test.tsx")),
          )
          .forEach((entry) => {
            testFiles.push(path.join(dir, entry.name));
          });

        // Also check subdirectories
        const subdirs = fs
          .readdirSync(dir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => path.join(dir, entry.name));

        subdirs.forEach((subdir) => {
          if (fs.existsSync(subdir)) {
            fs.readdirSync(subdir)
              .filter((file) => file.endsWith(".test.js") || file.endsWith(".test.tsx"))
              .forEach((file) => {
                testFiles.push(path.join(subdir, file));
              });
          }
        });
      }
    });

    return testFiles;
  } catch (error) {
    console.error("Error finding test files:", error);
    return [];
  }
}

/**
 * Print a flaky tests report
 */
function printFlakyTestsReport(flakyTests) {
  console.log("\n🔍 FLAKY TESTS REPORT");
  console.log("==================================================");

  if (flakyTests.length === 0) {
    console.log("✅ No flaky tests detected!");
    return;
  }

  console.log(`🚨 Detected ${flakyTests.length} flaky tests:\n`);

  // Sort by flakiness rate (most flaky first)
  flakyTests.sort((a, b) => b.flakinessRate - a.flakinessRate);

  flakyTests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   File: ${test.file}`);
    console.log(`   Passing runs: ${test.passingRuns}/${test.totalRuns}`);
    console.log(`   Failing runs: ${test.failingRuns}/${test.totalRuns}`);
    console.log(`   Flakiness rate: ${test.flakinessRate.toFixed(2)}%`);
    console.log();
  });

  console.log("Suggestions to fix flaky tests:");
  console.log("1. Check for timing issues or race conditions");
  console.log("2. Ensure proper cleanup between tests");
  console.log("3. Look for external dependencies or API calls");
  console.log("4. Add retry logic for inherently flaky operations");
  console.log("5. Consider increasing timeouts for slow operations");
}

/**
 * Save the flaky tests report to a file
 */
async function saveReport(flakyTests) {
  const report = {
    timestamp: new Date().toISOString(),
    flakyTests,
    summary: {
      totalFlakyTests: flakyTests.length,
      highPriorityTests: flakyTests.filter((t) => t.flakinessRate > 40).length,
      mediumPriorityTests: flakyTests.filter((t) => t.flakinessRate > 20 && t.flakinessRate <= 40)
        .length,
      lowPriorityTests: flakyTests.filter((t) => t.flakinessRate <= 20).length,
    },
  };

  // Ensure directory exists
  if (!fs.existsSync(TEST_REPORT_DIR)) {
    await mkdirAsync(TEST_REPORT_DIR, { recursive: true });
  }

  await writeFileAsync(FLAKY_REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Flaky tests report saved to ${FLAKY_REPORT_PATH}`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🔍 Flaky Tests Detection Tool");
    console.log("==================================================");

    // Create temp directory for results
    if (!fs.existsSync(TEMP_RESULTS_DIR)) {
      await mkdirAsync(TEMP_RESULTS_DIR, { recursive: true });
    }

    // Get test files to analyze
    const testFiles = getTestFiles();

    if (testFiles.length === 0) {
      console.error("No test files found to analyze");
      process.exit(1);
    }

    console.log(`Found ${testFiles.length} test files to analyze for flakiness`);

    // Run tests and collect results
    const allFlakyTests = [];

    for (const testFile of testFiles) {
      const runResults = await runTestFileMultipleTimes(testFile);
      const flakyTests = identifyFlakyTests(testFile, runResults);

      allFlakyTests.push(...flakyTests);
    }

    // Print and save report
    printFlakyTestsReport(allFlakyTests);
    await saveReport(allFlakyTests);

    console.log("✅ Flaky tests detection completed!");
  } catch (error) {
    console.error("Error detecting flaky tests:", error);
    process.exit(1);
  }
}

// Run the script
main();
