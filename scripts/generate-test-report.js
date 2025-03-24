/**
 * Generate Test Reports
 *
 * This script parses Jest test results and generates a human-readable report
 * showing test coverage, failed tests, and suggestions for improvement.
 */
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  coverageDir: "./coverage",
  outputDir: "./test-reports",
  summaryFile: "test-summary.json",
  reportFile: "test-report.md",
  coverageSummaryFile: "coverage-summary.json",
  jestOutputFile: "jest-output.json",
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Load test summary from file
 */
function loadTestSummary() {
  const summaryPath = path.join(config.outputDir, config.summaryFile);
  if (fs.existsSync(summaryPath)) {
    try {
      return JSON.parse(fs.readFileSync(summaryPath, "utf8"));
    } catch (e) {
      console.error("Error parsing test summary:", e);
    }
  }
  return null;
}

/**
 * Load coverage data from file
 */
function loadCoverageData() {
  const coveragePath = path.join(config.coverageDir, config.coverageSummaryFile);
  if (fs.existsSync(coveragePath)) {
    try {
      return JSON.parse(fs.readFileSync(coveragePath, "utf8"));
    } catch (e) {
      console.error("Error parsing coverage data:", e);
    }
  }
  return null;
}

/**
 * Load Jest output from file
 */
function loadJestOutput() {
  const jestOutputPath = path.join(config.outputDir, config.jestOutputFile);
  if (fs.existsSync(jestOutputPath)) {
    try {
      return JSON.parse(fs.readFileSync(jestOutputPath, "utf8"));
    } catch (e) {
      console.error("Error parsing Jest output:", e);
    }
  }
  return null;
}

/**
 * Generate markdown report
 */
function generateReport() {
  // Load data
  const summary = loadTestSummary();
  const coverage = loadCoverageData();
  const jestOutput = loadJestOutput();

  if (!summary && !coverage && !jestOutput) {
    console.error("No test data found. Run tests first.");
    return;
  }

  // Start building report
  let report = `# Test Results Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;

  // Add summary section
  report += `## Test Summary\n\n`;
  if (summary) {
    report += `- Total Test Suites: ${summary.numTotalTestSuites}\n`;
    report += `- Passed Test Suites: ${summary.numPassedTestSuites}\n`;
    report += `- Failed Test Suites: ${summary.numFailedTestSuites}\n`;
    report += `- Total Tests: ${summary.numTotalTests}\n`;
    report += `- Passed Tests: ${summary.numPassedTests}\n`;
    report += `- Failed Tests: ${summary.numFailedTests}\n`;
    report += `- Run Time: ${summary.startTime ? (Date.now() - summary.startTime) / 1000 : "N/A"} seconds\n\n`;
  } else {
    report += `No test summary data available.\n\n`;
  }

  // Add coverage section
  report += `## Coverage Summary\n\n`;
  if (coverage && coverage.total) {
    const total = coverage.total;
    report += `| Type | Covered | Total | Percentage |\n`;
    report += `| ---- | ------- | ----- | ---------- |\n`;
    report += `| Statements | ${total.statements.covered} | ${total.statements.total} | ${total.statements.pct}% |\n`;
    report += `| Branches | ${total.branches.covered} | ${total.branches.total} | ${total.branches.pct}% |\n`;
    report += `| Functions | ${total.functions.covered} | ${total.functions.total} | ${total.functions.pct}% |\n`;
    report += `| Lines | ${total.lines.covered} | ${total.lines.total} | ${total.lines.pct}% |\n\n`;
  } else {
    report += `No coverage data available.\n\n`;
  }

  // Add failed tests section
  report += `## Failed Tests\n\n`;
  if (jestOutput && jestOutput.testResults) {
    const failedSuites = jestOutput.testResults.filter(
      (suite) => suite.status === "failed" || suite.numFailingTests > 0,
    );

    if (failedSuites.length > 0) {
      failedSuites.forEach((suite) => {
        report += `### ${suite.name}\n\n`;

        const failedTests = suite.testResults.filter((test) => test.status === "failed");
        failedTests.forEach((test) => {
          report += `- ❌ ${test.fullName || test.title}\n`;
          if (test.failureMessages && test.failureMessages.length > 0) {
            report += `  - Error: ${test.failureMessages[0].split("\n")[0]}\n`;
          }
        });

        report += `\n`;
      });
    } else {
      report += `No failed tests! 🎉\n\n`;
    }
  } else {
    report += `No test results data available.\n\n`;
  }

  // Add recommendations section
  report += `## Recommendations\n\n`;

  // Coverage recommendations
  if (coverage && coverage.total) {
    const total = coverage.total;

    // Check for low coverage areas
    if (total.statements.pct < 80) {
      report += `- ⚠️ Statement coverage is below 80%. Consider adding more tests.\n`;
    }
    if (total.branches.pct < 70) {
      report += `- ⚠️ Branch coverage is below 70%. Add tests for conditional logic.\n`;
    }
    if (total.functions.pct < 75) {
      report += `- ⚠️ Function coverage is below 75%. Add tests for uncovered functions.\n`;
    }

    // Find files with low coverage
    const lowCoverageFiles = [];
    for (const [file, metrics] of Object.entries(coverage)) {
      if (file === "total") continue;

      if (metrics.statements.pct < 50 || metrics.functions.pct < 50) {
        lowCoverageFiles.push({ file, metrics });
      }
    }

    if (lowCoverageFiles.length > 0) {
      report += `\n### Files with Low Coverage\n\n`;
      lowCoverageFiles.forEach(({ file, metrics }) => {
        report += `- ${file}\n`;
        report += `  - Statements: ${metrics.statements.pct}%\n`;
        report += `  - Functions: ${metrics.functions.pct}%\n`;
        report += `  - Branches: ${metrics.branches.pct}%\n`;
      });
    }
  }

  // Write the report
  const reportPath = path.join(config.outputDir, config.reportFile);
  fs.writeFileSync(reportPath, report);

  console.log(`Report generated at ${reportPath}`);
  return reportPath;
}

// Run the report generator
const reportPath = generateReport();
if (reportPath) {
  // Print the first 20 lines of the report
  const report = fs.readFileSync(reportPath, "utf8");
  const previewLines = report.split("\n").slice(0, 20);
  console.log("\nReport Preview:\n");
  console.log(previewLines.join("\n"));
  console.log("\n... (see full report in file)");
}
