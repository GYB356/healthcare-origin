/**
 * Global TypeScript declarations
 */

// Declare global garbage collection function
declare namespace NodeJS {
  interface Global {
    gc?: () => void;
  }
}

// Ensure MongoDB test utilities are available in all test files
declare namespace globalThis {
  var mongoTestUtils: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    clear: jest.Mock;
  };
}

// Make Jest's fake timers globally available
declare namespace jest {
  interface Matchers<R> {
    toMatchImageSnapshot(): R;
  }
}
