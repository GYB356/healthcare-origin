// Utility to suppress React act() warnings
// This can be imported at the top of test files where act() warnings are expected
// but are not problematic for the tests

// Save original console.error
const originalConsoleError = console.error;

// Create a suppressor function that filters out act() warnings
export function suppressActWarnings() {
  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to") &&
      args[0].includes("inside a test was not wrapped in act(...)")
    ) {
      // Don't log the warning
      return;
    }
    originalConsoleError(...args);
  };
}

// Create a restore function to bring back original console.error
export function restoreActWarnings() {
  console.error = originalConsoleError;
}

// Automatically suppress warnings when this module is imported
suppressActWarnings();
