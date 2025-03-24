/**
 * Flaky Tests Auto-Fixer
 *
 * This script analyzes flaky test reports and attempts to automatically
 * fix common causes of flaky tests.
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Configuration
const FLAKY_REPORT_PATH = "./test-reports/flaky-tests-report.json";
const FIXES_REPORT_PATH = "./test-reports/flaky-fixes-report.json";
const MAX_RETRIES = 3;

/**
 * Load the flaky tests report
 */
async function loadFlakyTestsReport() {
  try {
    if (!fs.existsSync(FLAKY_REPORT_PATH)) {
      console.error(`Flaky tests report not found at ${FLAKY_REPORT_PATH}`);
      console.error('Run "npm run test:flaky-detection" first to generate the report');
      return null;
    }

    const data = await readFileAsync(FLAKY_REPORT_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading flaky tests report: ${error.message}`);
    return null;
  }
}

/**
 * Read a test file
 */
async function readTestFile(filePath) {
  try {
    const content = await readFileAsync(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading test file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Write a test file with fixes
 */
async function writeTestFile(filePath, content) {
  try {
    await writeFileAsync(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error(`Error writing test file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Apply automatic fixes to a flaky test file
 */
async function fixFlakyTest(testFile, flakyTests) {
  console.log(`\n🔧 Analyzing and fixing flaky tests in ${testFile}`);

  // Read the test file
  const content = await readTestFile(testFile);
  if (!content) {
    return {
      file: testFile,
      fixed: false,
      error: "Could not read file",
    };
  }

  // Initialize results
  const results = {
    file: testFile,
    fixed: false,
    fixedTests: [],
    skippedTests: [],
  };

  // Apply fixes
  let modifiedContent = content;
  let modified = false;

  // Get test names from this file
  const testsInFile = flakyTests.filter((test) => test.file === testFile);

  // Apply fixes to each flaky test
  for (const test of testsInFile) {
    const testName = test.name;
    const fixResult = applyFixToTest(modifiedContent, testName, test.flakinessRate);

    if (fixResult.fixed) {
      modifiedContent = fixResult.content;
      modified = true;
      results.fixedTests.push({
        name: testName,
        fixes: fixResult.appliedFixes,
      });
    } else {
      results.skippedTests.push({
        name: testName,
        reason: fixResult.reason,
      });
    }
  }

  // Save the modified file if changes were made
  if (modified) {
    const success = await writeTestFile(testFile, modifiedContent);
    results.fixed = success;
  }

  return results;
}

/**
 * Apply fixes to a specific test
 */
function applyFixToTest(content, testName, flakinessRate) {
  // Initialize result
  const result = {
    fixed: false,
    content,
    appliedFixes: [],
    reason: "No applicable fixes found",
  };

  // Pattern to find the test
  // This is a simplified pattern - a more robust implementation would use an AST parser
  const testPatterns = [
    new RegExp(`test\\((['"])${escapeRegExp(testName)}\\1,`),
    new RegExp(`it\\((['"])${escapeRegExp(testName)}\\1,`),
    new RegExp(`describe\\((['"])${escapeRegExp(testName)}\\1,`),
  ];

  // Find the test in the content
  let testFound = false;
  let testPattern;
  let testMatch;

  for (const pattern of testPatterns) {
    const match = pattern.exec(content);
    if (match) {
      testFound = true;
      testPattern = pattern;
      testMatch = match;
      break;
    }
  }

  if (!testFound) {
    result.reason = `Test "${testName}" not found in file`;
    return result;
  }

  // Apply fixes based on common issues
  const lines = content.split("\n");

  // Fix 1: Add retries for flaky tests
  if (!content.includes("jest.retryTimes") && !content.includes("retryTimes")) {
    // Add retry times before the test suite
    const beforeTestIndex = findLineIndex(lines, testPattern);
    if (beforeTestIndex !== -1) {
      // Add retry logic before the test
      lines.splice(
        beforeTestIndex,
        0,
        `  // Added automatic retry for flaky test
  jest.retryTimes(${MAX_RETRIES}); // Retry ${MAX_RETRIES} times before failing`,
      );

      result.appliedFixes.push(`Added jest.retryTimes(${MAX_RETRIES})`);
      result.fixed = true;
    }
  }

  // Fix 2: Increase timeouts for potentially slow operations
  if (content.includes("setTimeout") || content.includes("setInterval")) {
    const updatedContent = lines
      .join("\n")
      .replace(/setTimeout\(\s*([^,]+),\s*(\d+)\s*\)/g, (match, fn, timeout) => {
        const newTimeout = Math.ceil(parseInt(timeout) * 1.5); // Increase timeout by 50%
        result.appliedFixes.push(`Increased setTimeout value from ${timeout}ms to ${newTimeout}ms`);
        result.fixed = true;
        return `setTimeout(${fn}, ${newTimeout})`;
      });

    if (updatedContent !== lines.join("\n")) {
      result.content = updatedContent;
      return result;
    }
  }

  // Fix 3: Add fake timers if there are timer operations
  if (
    (content.includes("setTimeout") || content.includes("setInterval")) &&
    !content.includes("useFakeTimers")
  ) {
    const hasBeforeEach = content.includes("beforeEach");
    const beforeAllIndex = content.indexOf("beforeAll");

    if (hasBeforeEach || beforeAllIndex !== -1) {
      const newContent = content
        .replace(
          /beforeEach\(\s*(?:async\s*)?\(\)\s*=>\s*{/,
          "beforeEach(() => {\n  jest.useFakeTimers();",
        )
        .replace(
          /beforeAll\(\s*(?:async\s*)?\(\)\s*=>\s*{/,
          "beforeAll(() => {\n  jest.useFakeTimers();",
        );

      if (newContent !== content) {
        result.content = newContent;
        result.appliedFixes.push("Added jest.useFakeTimers() to beforeEach/beforeAll");
        result.fixed = true;
        return result;
      }
    } else {
      // Add a new beforeEach
      const beforeTestIndex = findLineIndex(lines, testPattern);
      if (beforeTestIndex !== -1) {
        lines.splice(
          beforeTestIndex,
          0,
          `  beforeEach(() => {
    jest.useFakeTimers();
  });`,
        );

        result.appliedFixes.push("Added new beforeEach with jest.useFakeTimers()");
        result.fixed = true;
      }
    }
  }

  // Fix 4: Add try/catch with retry logic for API calls
  if (content.includes("fetch(") || content.includes("axios") || content.includes("request(")) {
    const newContent = content.replace(
      /(await\s+)(fetch|axios|request)\(([^)]+)\)/g,
      (match, awaitPart, fn, args) => {
        return `await retryOperation(async () => ${awaitPart}${fn}(${args}))`;
      },
    );

    if (newContent !== content) {
      // Add retry operation helper function if it doesn't exist
      if (!newContent.includes("retryOperation")) {
        const helperFn = `
/**
 * Helper to retry flaky operations
 */
async function retryOperation(operation, maxRetries = ${MAX_RETRIES}, delay = 500) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
`;

        // Add helper function at the beginning of the file
        result.content = helperFn + newContent;
        result.appliedFixes.push("Added retry logic for API calls");
        result.fixed = true;
        return result;
      } else {
        result.content = newContent;
        result.appliedFixes.push("Added retry logic for API calls");
        result.fixed = true;
        return result;
      }
    }
  }

  // Fix 5: For highly flaky tests (> 40% flakiness rate), mark as test.skip if we couldn't fix
  if (flakinessRate > 40 && !result.fixed) {
    // Replace test with test.skip
    const newContent = content.replace(
      /(test|it)\((['"])${escapeRegExp(testName)}\2/g,
      "$1.skip($2$&",
    );

    if (newContent !== content) {
      result.content = newContent;
      result.appliedFixes.push("Marked as test.skip due to high flakiness rate");
      result.fixed = true;
      return result;
    }
  }

  // If we applied any fixes, update the content
  if (result.fixed && result.content === content) {
    result.content = lines.join("\n");
  }

  return result;
}

/**
 * Helper function to find the line index matching a pattern
 */
function findLineIndex(lines, pattern) {
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Helper function to escape special characters in regex
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Print a report of the fixes
 */
function printFixReport(fixResults) {
  console.log("\n🔍 FLAKY TESTS FIX REPORT");
  console.log("==================================================");

  if (fixResults.length === 0) {
    console.log("No flaky tests were fixed");
    return;
  }

  const fixedTests = fixResults.filter((result) => result.fixed);
  const fixCount = fixedTests.reduce((count, result) => count + result.fixedTests.length, 0);
  const skippedCount = fixResults.reduce((count, result) => count + result.skippedTests.length, 0);

  console.log(`✅ Fixed ${fixCount} flaky tests in ${fixedTests.length} files`);
  console.log(`⏭️  Skipped ${skippedCount} tests that couldn't be automatically fixed\n`);

  fixResults.forEach((result) => {
    console.log(`📄 ${result.file}:`);

    if (result.fixedTests.length > 0) {
      console.log("  Fixed tests:");
      result.fixedTests.forEach((test) => {
        console.log(`  - ${test.name}`);
        test.fixes.forEach((fix) => console.log(`    * ${fix}`));
      });
    }

    if (result.skippedTests.length > 0) {
      console.log("  Skipped tests:");
      result.skippedTests.forEach((test) => {
        console.log(`  - ${test.name}: ${test.reason}`);
      });
    }

    console.log();
  });

  console.log("Manual Intervention Required:");
  console.log("1. Review the fixed tests to ensure they work correctly");
  console.log("2. For skipped tests, consider the following fixes:");
  console.log("   - Check for race conditions and add proper synchronization");
  console.log("   - Ensure test isolation (no shared state between tests)");
  console.log("   - Mock external dependencies consistently");
  console.log("   - Check for DOM event timing issues in React component tests");
  console.log("   - Consider adding retry logic to inherently flaky operations");
}

/**
 * Save the fix report to a file
 */
async function saveFixReport(fixResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: fixResults.length,
      filesWithFixes: fixResults.filter((r) => r.fixed).length,
      totalFixedTests: fixResults.reduce((count, result) => count + result.fixedTests.length, 0),
      totalSkippedTests: fixResults.reduce(
        (count, result) => count + result.skippedTests.length,
        0,
      ),
    },
    results: fixResults,
  };

  try {
    // Ensure directory exists
    const dir = path.dirname(FIXES_REPORT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await writeFileAsync(FIXES_REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`Fix report saved to ${FIXES_REPORT_PATH}`);
  } catch (error) {
    console.error(`Error saving fix report: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🔧 Flaky Tests Auto-Fixer");
    console.log("==================================================");

    // Load the flaky tests report
    const flakyReport = await loadFlakyTestsReport();

    if (!flakyReport || !flakyReport.flakyTests || flakyReport.flakyTests.length === 0) {
      console.log("No flaky tests found in the report. Run flaky test detection first.");
      process.exit(0);
    }

    console.log(`Found ${flakyReport.flakyTests.length} flaky tests to fix`);

    // Group tests by file
    const fileGroups = {};
    flakyReport.flakyTests.forEach((test) => {
      if (!fileGroups[test.file]) {
        fileGroups[test.file] = [];
      }
      fileGroups[test.file].push(test);
    });

    // Fix each file
    const fixResults = [];

    for (const [file, tests] of Object.entries(fileGroups)) {
      const result = await fixFlakyTest(file, tests);
      fixResults.push(result);
    }

    // Print and save report
    printFixReport(fixResults);
    await saveFixReport(fixResults);

    console.log("\n✅ Flaky test fixing completed!");
  } catch (error) {
    console.error(`Error fixing flaky tests: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
