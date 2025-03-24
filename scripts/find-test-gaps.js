/**
 * Find Test Coverage Gaps
 *
 * This script analyzes the codebase to find files that lack corresponding test files
 * and generates recommendations for improving test coverage.
 */
const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Configuration
const config = {
  srcDirs: ["./src", "./frontend", "./components", "./backend"],
  srcExts: [".js", ".jsx", ".ts", ".tsx"],
  testExts: [
    ".test.js",
    ".test.jsx",
    ".test.ts",
    ".test.tsx",
    ".spec.js",
    ".spec.jsx",
    ".spec.ts",
    ".spec.tsx",
  ],
  testDirs: ["./src", "./frontend", "./components", "./backend", "./__tests__"],
  ignorePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.next/**"],
  outputFile: "./test-reports/test-gaps.md",
};

// Ensure output directory exists
const outputDir = path.dirname(config.outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Get all source files
 */
function getSourceFiles() {
  const files = [];

  // Find all source files
  config.srcDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) return;

    config.srcExts.forEach((ext) => {
      const pattern = `${dir}/**/*${ext}`;
      const matches = glob.sync(pattern, { ignore: config.ignorePatterns });
      files.push(...matches);
    });
  });

  return files;
}

/**
 * Get all test files
 */
function getTestFiles() {
  const files = [];

  // Find all test files
  config.testDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) return;

    config.testExts.forEach((ext) => {
      const pattern = `${dir}/**/*${ext}`;
      const matches = glob.sync(pattern, { ignore: config.ignorePatterns });
      files.push(...matches);
    });
  });

  return files;
}

/**
 * Determine if a source file has a corresponding test file
 */
function hasTestFile(sourceFile, testFiles) {
  const { name: fileName, dir: fileDir } = path.parse(sourceFile);

  // Check for test files with the same name in various locations
  const possibleTestPatterns = [
    // Same name with .test extension
    new RegExp(`${fileName}\\.test\\.(js|jsx|ts|tsx)$`),
    // Same name with .spec extension
    new RegExp(`${fileName}\\.spec\\.(js|jsx|ts|tsx)$`),
    // Test directory structure
    new RegExp(`${fileName}\\.(test|spec)\\.(js|jsx|ts|tsx)$`),
    // __tests__ directory
    new RegExp(`__tests__.*/${fileName}\\.(test|spec)\\.(js|jsx|ts|tsx)$`),
    // Same name in __tests__ directory
    new RegExp(`__tests__/.*${fileName}\\.(js|jsx|ts|tsx)$`),
  ];

  // Check if any test file matches the patterns
  return testFiles.some((testFile) => {
    return possibleTestPatterns.some((pattern) => pattern.test(testFile));
  });
}

/**
 * Generate the report
 */
function generateReport() {
  // Get all files
  const sourceFiles = getSourceFiles();
  const testFiles = getTestFiles();

  console.log(`Found ${sourceFiles.length} source files and ${testFiles.length} test files`);

  // Find source files without tests
  const filesWithoutTests = sourceFiles.filter((file) => {
    // Skip files that are likely not testable
    if (file.includes(".d.ts") || file.includes("types.ts") || file.includes("index.ts")) {
      return false;
    }

    return !hasTestFile(file, testFiles);
  });

  // Calculate coverage percentage
  const totalFiles = sourceFiles.length;
  const testedFiles = totalFiles - filesWithoutTests.length;
  const coveragePercentage = ((testedFiles / totalFiles) * 100).toFixed(2);

  // Group files by directory
  const filesByDirectory = {};
  filesWithoutTests.forEach((file) => {
    const dir = path.dirname(file);
    if (!filesByDirectory[dir]) {
      filesByDirectory[dir] = [];
    }
    filesByDirectory[dir].push(path.basename(file));
  });

  // Generate markdown report
  let report = `# Test Coverage Gaps Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;

  report += `## Summary\n\n`;
  report += `- Total Source Files: ${totalFiles}\n`;
  report += `- Files with Tests: ${testedFiles}\n`;
  report += `- Files without Tests: ${filesWithoutTests.length}\n`;
  report += `- Test Coverage: ${coveragePercentage}%\n\n`;

  report += `## Files Without Tests\n\n`;

  // Sort directories by number of untested files
  const sortedDirs = Object.keys(filesByDirectory).sort((a, b) => {
    return filesByDirectory[b].length - filesByDirectory[a].length;
  });

  // Add each directory and its untested files
  sortedDirs.forEach((dir) => {
    const files = filesByDirectory[dir];
    report += `### ${dir} (${files.length} files)\n\n`;
    files.forEach((file) => {
      report += `- ${file}\n`;
    });
    report += `\n`;
  });

  report += `## Recommendations\n\n`;

  // Add general recommendations
  report += `### Priority Areas\n\n`;

  // Find directories with the most untested files (top 3)
  if (sortedDirs.length > 0) {
    report += `Focus on adding tests for these directories first:\n\n`;
    sortedDirs.slice(0, 3).forEach((dir) => {
      report += `- ${dir} (${filesByDirectory[dir].length} untested files)\n`;
    });
    report += `\n`;
  }

  // Add specific recommendations
  report += `### Specific Recommendations\n\n`;

  // Add recommendations for important-looking files
  const priorityFiles = filesWithoutTests.filter((file) => {
    const fileName = path.basename(file).toLowerCase();
    return (
      fileName.includes("controller") ||
      fileName.includes("service") ||
      fileName.includes("component") ||
      fileName.includes("page") ||
      fileName.includes("route") ||
      fileName.includes("model")
    );
  });

  if (priorityFiles.length > 0) {
    report += `Start by adding tests for these important files:\n\n`;
    priorityFiles.slice(0, 10).forEach((file) => {
      report += `- ${file}\n`;
    });
  } else {
    report += `No high-priority files identified.\n`;
  }

  // Write the report
  fs.writeFileSync(config.outputFile, report);
  console.log(`Test gaps report generated at ${config.outputFile}`);
  return config.outputFile;
}

// Run the report generator
const reportPath = generateReport();
if (reportPath) {
  // Print a summary
  console.log("\nTest Gap Analysis Summary:");
  console.log("=========================\n");

  // Read the report file and extract summary
  const report = fs.readFileSync(reportPath, "utf8");
  const summaryMatch = report.match(/## Summary\n\n([\s\S]*?)\n\n/);
  if (summaryMatch && summaryMatch[1]) {
    console.log(summaryMatch[1]);
  }
}
