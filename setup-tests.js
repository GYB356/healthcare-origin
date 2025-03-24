/**
 * Jest setup file that runs before all tests
 * This file handles mocking external dependencies
 */

// Mock MongoDB
jest.mock("mongodb", () => {
  // Create mock implementation
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: "mock-id" }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    toArray: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    project: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(0),
    countDocuments: jest.fn().mockResolvedValue(0),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  const mockClient = {
    connect: jest.fn().mockResolvedValue(this),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(true),
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn((id) => ({ toString: () => id || "mock-object-id" })),
  };
});

// Set environment variables for testing
process.env.NODE_ENV = "test";
process.env.TEST_MODE = "standalone";

// Global test setup
beforeAll(() => {
  // Any setup code that should run before all tests
  console.log("Running tests in standalone mode with mocked dependencies");
});

// Global test teardown
afterAll(() => {
  // Any cleanup code that should run after all tests
  console.log("All tests completed, cleaning up mocks");
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Add global matchers or utilities
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
