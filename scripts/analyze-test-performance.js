/**
 * Test Performance Analyzer
 *
 * This script analyzes test execution times from Jest outputs to help
 * identify slow tests and optimize test performance.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Configuration
const TEST_REPORT_DIR = "./test-reports";
const PERFORMANCE_REPORT_PATH = path.join(TEST_REPORT_DIR, "performance-report.json");
const SLOW_TEST_THRESHOLD = 1000; // 1 second

// Create the reports directory if it doesn't exist
if (!fs.existsSync(TEST_REPORT_DIR)) {
  fs.mkdirSync(TEST_REPORT_DIR, { recursive: true });
}

/**
 * Run tests with Jest and capture timing data
 */
async function runTestsWithTiming() {
  console.log("Running tests with timing information...");

  try {
    // Run tests with JSON reporter to get detailed timing
    const result = execSync(
      'jest --config jest.optimized.config.js --json --outputFile="./test-reports/jest-results.json"',
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );

    console.log("Tests completed successfully");
    return true;
  } catch (error) {
    // Even if some tests fail, we still want to analyze the timings
    console.warn("Some tests failed, but we'll analyze the available timing data");
    return false;
  }
}

/**
 * Parse the Jest results and extract timing information
 */
async function parseTestResults() {
  try {
    const data = await readFileAsync(path.join(TEST_REPORT_DIR, "jest-results.json"), "utf8");
    const results = JSON.parse(data);

    // Extract the test results
    const testResults = [];
    const failedTests = [];
    let totalDuration = 0;

    results.testResults.forEach((fileResult) => {
      const filePath = fileResult.name;
      const fileRelativePath = path.relative(process.cwd(), filePath);

      fileResult.testResults.forEach((testResult) => {
        const fullName = testResult.fullName || testResult.title;
        const duration = testResult.duration || 0;
        totalDuration += duration;

        const testInfo = {
          name: fullName,
          file: fileRelativePath,
          duration,
          slow: duration > SLOW_TEST_THRESHOLD,
          status: testResult.status,
        };

        testResults.push(testInfo);

        if (testResult.status === "failed") {
          failedTests.push({
            ...testInfo,
            failureMessages: testResult.failureMessages,
          });
        }
      });
    });

    // Sort tests by duration (descending)
    testResults.sort((a, b) => b.duration - a.duration);

    return {
      testResults,
      failedTests,
      summary: {
        totalTests: results.numTotalTests,
        passedTests: results.numPassedTests,
        failedTests: results.numFailedTests,
        totalDuration: totalDuration,
        averageDuration: totalDuration / results.numTotalTests,
        slowTests: testResults.filter((t) => t.slow).length,
      },
    };
  } catch (error) {
    console.error("Error parsing test results:", error);
    throw error;
  }
}

/**
 * Generate optimization suggestions based on test results
 */
function generateSuggestions(results) {
  const suggestions = [];

  // Suggest optimizing slow tests
  const slowTests = results.testResults.filter((t) => t.slow);
  if (slowTests.length > 0) {
    suggestions.push({
      type: "SLOW_TESTS",
      message: `Found ${slowTests.length} slow tests that take more than ${SLOW_TEST_THRESHOLD}ms to run`,
      items: slowTests.slice(0, 10).map((t) => `${t.name} (${t.duration}ms) in ${t.file}`),
    });
  }

  // Check for test files with many slow tests
  const fileSlowCounts = {};
  slowTests.forEach((test) => {
    fileSlowCounts[test.file] = (fileSlowCounts[test.file] || 0) + 1;
  });

  const slowFiles = Object.entries(fileSlowCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  if (slowFiles.length > 0) {
    suggestions.push({
      type: "SLOW_FILES",
      message: "These files contain multiple slow tests and should be optimized:",
      items: slowFiles.map(([file, count]) => `${file} (${count} slow tests)`),
    });
  }

  // Check for failed tests
  if (results.failedTests.length > 0) {
    suggestions.push({
      type: "FAILED_TESTS",
      message: "Fix these failing tests:",
      items: results.failedTests.map((t) => `${t.name} in ${t.file}`),
    });
  }

  return suggestions;
}

/**
 * Print the performance report to console
 */
function printReport(results, suggestions) {
  console.log("\n======= TEST PERFORMANCE REPORT =======\n");

  // Print summary
  console.log("SUMMARY:");
  console.log(`- Total Tests: ${results.summary.totalTests}`);
  console.log(`- Passed Tests: ${results.summary.passedTests}`);
  console.log(`- Failed Tests: ${results.summary.failedTests}`);
  console.log(`- Total Duration: ${(results.summary.totalDuration / 1000).toFixed(2)} seconds`);
  console.log(`- Average Test Duration: ${results.summary.averageDuration.toFixed(2)} ms`);
  console.log(`- Slow Tests: ${results.summary.slowTests} (> ${SLOW_TEST_THRESHOLD}ms)`);

  // Print top 10 slowest tests
  console.log("\nTOP 10 SLOWEST TESTS:");
  results.testResults.slice(0, 10).forEach((test, index) => {
    console.log(`${index + 1}. ${test.name} (${test.duration.toFixed(2)} ms) in ${test.file}`);
  });

  // Print suggestions
  if (suggestions.length > 0) {
    console.log("\nSUGGESTIONS:");
    suggestions.forEach((suggestion) => {
      console.log(`\n${suggestion.message}`);
      suggestion.items.forEach((item) => console.log(`- ${item}`));
    });
  }

  console.log("\n========================================\n");
}

/**
 * Save the performance data to a JSON file
 */
async function savePerformanceData(results, suggestions) {
  const data = {
    timestamp: new Date().toISOString(),
    summary: results.summary,
    slowTests: results.testResults.filter((t) => t.slow),
    top10SlowestTests: results.testResults.slice(0, 10),
    failedTests: results.failedTests,
    suggestions,
  };

  await writeFileAsync(PERFORMANCE_REPORT_PATH, JSON.stringify(data, null, 2));
  console.log(`Performance report saved to ${PERFORMANCE_REPORT_PATH}`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🔍 Test Performance Analyzer");
    console.log("---------------------------");

    await runTestsWithTiming();
    const results = await parseTestResults();
    const suggestions = generateSuggestions(results);

    printReport(results, suggestions);
    await savePerformanceData(results, suggestions);

    console.log("✅ Analysis complete!");
  } catch (error) {
    console.error("Error analyzing test performance:", error);
    process.exit(1);
  }
}

// Run the script
main();
