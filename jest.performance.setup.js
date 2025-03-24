/**
 * Jest Performance Setup
 *
 * This file contains performance optimizations for Jest tests:
 * - Enabling parallel test execution where appropriate
 * - Mocking expensive operations
 * - Setting performance thresholds and monitoring
 * - Managing resources efficiently
 */

// Track test execution time
const testTimes = {};
const slowTestThreshold = 500; // ms

// Memory leak detection
const memorySnapshots = {};
const memoryLeakThreshold = 10 * 1024 * 1024; // 10MB

// Performance monitoring
beforeEach(async () => {
  // Store the start time for this test
  const testName = expect.getState().currentTestName;
  testTimes[testName] = Date.now();

  // Take memory snapshot for leak detection
  memorySnapshots[testName] = process.memoryUsage();

  // Reset pending timers and intervals for each test
  jest.clearAllTimers();
});

afterEach(async () => {
  const testName = expect.getState().currentTestName;
  const startTime = testTimes[testName];
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Flag slow tests
  if (duration > slowTestThreshold) {
    console.warn(`⚠️ Slow test detected: ${testName} took ${duration}ms`);
  }

  // Check for memory leaks
  const startMemory = memorySnapshots[testName];
  const endMemory = process.memoryUsage();
  const heapDiff = endMemory.heapUsed - startMemory.heapUsed;

  if (heapDiff > memoryLeakThreshold) {
    console.warn(`⚠️ Possible memory leak detected in test: ${testName}`);
    console.warn(`   Heap usage increased by ${Math.round(heapDiff / 1024 / 1024)}MB`);
  }

  // Clean up
  delete testTimes[testName];
  delete memorySnapshots[testName];
});

// Avoid real timers for faster tests
jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });

// Create optimized fetch mock
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  }),
);

// Mock expensive browser APIs when in Node environment
if (typeof window !== "undefined") {
  // Fast localStorage mock
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Fast sessionStorage mock
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock scrollTo
  window.scrollTo = jest.fn();

  // Mock IntersectionObserver
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      return null;
    }
    unobserve() {
      return null;
    }
    disconnect() {
      return null;
    }
  };
}

// Enable parallel testing for suitable tests
global.test.concurrent = test.concurrent;
global.it.concurrent = test.concurrent;

// Optimize async test handling
jest.retryTimes(1); // Retry flaky tests once

// Track memory leaks
const initialMemory = process.memoryUsage();
afterAll(() => {
  const finalMemory = process.memoryUsage();
  const memoryDiff = {
    rss: finalMemory.rss - initialMemory.rss,
    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
    external: finalMemory.external - initialMemory.external,
  };

  console.log("Memory usage difference:", {
    rss: `${(memoryDiff.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryDiff.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memoryDiff.external / 1024 / 1024).toFixed(2)} MB`,
  });

  // Force garbage collection to help find leaks
  if (global.gc) {
    global.gc();
  }
});
