// Utility to suppress React act() warnings
const originalConsoleError = console.error;

export function suppressActWarnings() {
  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('inside a test was not wrapped in act(...)')
    ) {
      // Don't log the warning
      return;
    }
    originalConsoleError(...args);
  };
}

export function restoreActWarnings() {
  console.error = originalConsoleError;
}

// Automatically suppress warnings when this module is imported
suppressActWarnings(); 