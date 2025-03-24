/**
 * Test Performance Optimizer
 *
 * This script analyzes the performance of tests, identifies the slowest ones,
 * and provides recommendations for optimization.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const PERFORMANCE_REPORT_PATH = "./test-reports/performance-report.json";
const SLOW_TEST_THRESHOLD = 1000; // Tests slower than 1000ms are considered slow
const MAX_SLOW_TESTS_TO_ANALYZE = 5;

/**
 * Run tests and generate performance data
 */
function runTestsWithPerformance() {
  console.log("Running tests with performance analysis...");

  try {
    // Run tests with Jest's --json flag to get detailed timing information
    execSync(
      "jest --config jest.optimized.config.js --json --outputFile=./test-reports/performance-data.json",
      { stdio: "inherit" },
    );
    return true;
  } catch (error) {
    console.warn("Some tests failed, but we can still analyze performance data");
    return false;
  }
}

/**
 * Parse test results and extract timing data
 */
function parseTestPerformanceData() {
  try {
    if (!fs.existsSync("./test-reports/performance-data.json")) {
      console.error("Performance data file not found. Run tests first.");
      return null;
    }

    const data = fs.readFileSync("./test-reports/performance-data.json", "utf8");
    const results = JSON.parse(data);

    // Extract timing information for all tests
    const testTimings = [];
    let totalDuration = 0;

    results.testResults.forEach((fileResult) => {
      const filePath = fileResult.name;
      const fileName = path.relative(process.cwd(), filePath);

      fileResult.testResults.forEach((testResult) => {
        const duration = testResult.duration || 0;
        totalDuration += duration;

        testTimings.push({
          name: testResult.fullName || testResult.title,
          file: fileName,
          duration,
          isSlow: duration > SLOW_TEST_THRESHOLD,
        });
      });
    });

    // Sort by duration (slowest first)
    testTimings.sort((a, b) => b.duration - a.duration);

    return {
      testTimings,
      summary: {
        totalTests: results.numTotalTests,
        passedTests: results.numPassedTests,
        failedTests: results.numFailedTests,
        slowTests: testTimings.filter((t) => t.isSlow).length,
        totalDuration,
        averageDuration: totalDuration / results.numTotalTests,
      },
    };
  } catch (error) {
    console.error("Error parsing performance data:", error);
    return null;
  }
}

/**
 * Analyze the code of a slow test to identify performance issues
 */
function analyzeSlowTest(testFile, testName) {
  try {
    if (!fs.existsSync(testFile)) {
      return {
        file: testFile,
        test: testName,
        issues: ["File not found"],
        recommendations: ["Verify the test file path"],
      };
    }

    const fileContent = fs.readFileSync(testFile, "utf8");
    const lines = fileContent.split("\n");

    // Simple heuristic analysis - look for common performance issues
    const issues = [];
    const recommendations = [];

    // Check for MongoDB operations
    if (
      fileContent.includes("mongoose") &&
      (fileContent.includes(".find(") || fileContent.includes(".findOne("))
    ) {
      issues.push("Multiple database queries");
      recommendations.push("Batch database operations or use mocks instead of real DB queries");
    }

    // Check for setTimeout without jest.useFakeTimers
    if (fileContent.includes("setTimeout") && !fileContent.includes("jest.useFakeTimers")) {
      issues.push("Using real timers with setTimeout");
      recommendations.push("Add jest.useFakeTimers() in beforeEach/beforeAll");
    }

    // Check for heavy data creation
    if (fileContent.includes("Array(") && fileContent.includes(".fill(")) {
      issues.push("Creating large arrays or data structures");
      recommendations.push("Reduce the size of test data or use smaller samples");
    }

    // Check for multiple assertions
    const assertionCount = (fileContent.match(/expect\(/g) || []).length;
    if (assertionCount > 10) {
      issues.push(`High number of assertions (${assertionCount})`);
      recommendations.push("Split into multiple smaller tests");
    }

    // Check for unnecessary beforeEach/afterEach overhead
    if (fileContent.includes("beforeEach") && fileContent.includes("clearDatabase")) {
      issues.push("Database cleared before each test");
      recommendations.push("Group tests that can share the same database state");
    }

    return {
      file: testFile,
      test: testName,
      issues: issues.length ? issues : ["No specific issues detected"],
      recommendations: recommendations.length
        ? recommendations
        : ["Manually review the test for inefficiencies"],
    };
  } catch (error) {
    console.error(`Error analyzing ${testFile}:`, error);
    return {
      file: testFile,
      test: testName,
      issues: [`Error analyzing test: ${error.message}`],
      recommendations: ["Manual review required"],
    };
  }
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationReport(performanceData) {
  if (!performanceData) {
    return null;
  }

  const { testTimings, summary } = performanceData;

  // Get the slowest tests
  const slowestTests = testTimings
    .filter((test) => test.isSlow)
    .slice(0, MAX_SLOW_TESTS_TO_ANALYZE);

  // Analyze each slow test
  const testAnalyses = slowestTests.map((test) => analyzeSlowTest(test.file, test.name));

  // Generate the report
  const report = {
    summary,
    slowestTests: slowestTests.map((test) => ({
      name: test.name,
      file: test.file,
      duration: test.duration,
    })),
    optimizationSuggestions: testAnalyses,
    generalRecommendations: [
      "Use jest.mock() for external dependencies",
      "Apply jest.useFakeTimers() for tests with timeouts",
      "Use in-memory database or mocks instead of real MongoDB for non-integration tests",
      "Batch DB operations where possible",
      "Split large test suites into smaller, more focused tests",
      "Use parallel test execution for independent tests",
    ],
  };

  // Save the report
  const reportDir = path.dirname(PERFORMANCE_REPORT_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(PERFORMANCE_REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  return report;
}

/**
 * Print the report to the console
 */
function printReport(report) {
  if (!report) {
    console.error("No performance report available");
    return;
  }

  console.log("\n=================================================");
  console.log("TEST PERFORMANCE OPTIMIZATION REPORT");
  console.log("=================================================");

  console.log("\nSummary:");
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed Tests: ${report.summary.passedTests}`);
  console.log(`Failed Tests: ${report.summary.failedTests}`);
  console.log(`Slow Tests (>${SLOW_TEST_THRESHOLD}ms): ${report.summary.slowTests}`);
  console.log(`Total Duration: ${Math.round(report.summary.totalDuration / 1000)}s`);
  console.log(`Average Test Duration: ${Math.round(report.summary.averageDuration)}ms`);

  console.log("\nTop 5 Slowest Tests:");
  report.slowestTests.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name} (${Math.round(test.duration)}ms)`);
    console.log(`   File: ${test.file}`);

    const analysis = report.optimizationSuggestions[index];
    console.log("   Issues:");
    analysis.issues.forEach((issue) => console.log(`   - ${issue}`));

    console.log("   Recommendations:");
    analysis.recommendations.forEach((rec) => console.log(`   - ${rec}`));
  });

  console.log("\nGeneral Recommendations:");
  report.generalRecommendations.forEach((rec) => {
    console.log(`- ${rec}`);
  });

  console.log("\nDetailed report saved to:", PERFORMANCE_REPORT_PATH);
  console.log("=================================================\n");
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Test Performance Optimizer");
  console.log("---------------------------");

  // Create test-reports directory if it doesn't exist
  if (!fs.existsSync("./test-reports")) {
    fs.mkdirSync("./test-reports", { recursive: true });
  }

  // Run tests and collect performance data
  const testsRan = runTestsWithPerformance();

  if (!testsRan) {
    console.warn("Tests execution had issues, but we can still analyze existing performance data");
  }

  // Parse and analyze the performance data
  const performanceData = parseTestPerformanceData();

  if (!performanceData) {
    console.error("Failed to analyze test performance. Make sure tests run successfully first.");
    process.exit(1);
  }

  // Generate and print optimization report
  const report = generateOptimizationReport(performanceData);
  printReport(report);

  console.log("Performance analysis complete!");
}

// Run the script
main().catch((error) => {
  console.error("Error in test performance optimizer:", error);
  process.exit(1);
});
