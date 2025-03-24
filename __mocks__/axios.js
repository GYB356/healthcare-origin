/**
 * Enhanced Axios Mock
 *
 * This mock provides a more powerful implementation of axios with:
 * - Predefined response management
 * - Request tracking
 * - Error simulation capabilities
 */

// Store for predefined responses by URL
const mockResponses = new Map();

// Store for request history
const requestHistory = [];

// Create the axios mock object
const axiosMock = {
  create: jest.fn(() => axiosMock),
  get: jest.fn((url, config) => {
    const request = { method: "get", url, config };
    requestHistory.push(request);

    // Check for predefined responses
    if (mockResponses.has(url)) {
      const response = mockResponses.get(url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve({ data: response, status: 200 });
    }

    // Default response
    return Promise.resolve({ data: {}, status: 200 });
  }),
  post: jest.fn((url, data, config) => {
    const request = { method: "post", url, data, config };
    requestHistory.push(request);

    // Check for predefined responses
    if (mockResponses.has(url)) {
      const response = mockResponses.get(url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve({ data: response, status: 201 });
    }

    // Default response
    return Promise.resolve({ data: {}, status: 201 });
  }),
  put: jest.fn((url, data, config) => {
    const request = { method: "put", url, data, config };
    requestHistory.push(request);

    // Check for predefined responses
    if (mockResponses.has(url)) {
      const response = mockResponses.get(url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve({ data: response, status: 200 });
    }

    // Default response
    return Promise.resolve({ data: {}, status: 200 });
  }),
  delete: jest.fn((url, config) => {
    const request = { method: "delete", url, config };
    requestHistory.push(request);

    // Check for predefined responses
    if (mockResponses.has(url)) {
      const response = mockResponses.get(url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve({ data: response, status: 200 });
    }

    // Default response
    return Promise.resolve({ data: {}, status: 200 });
  }),
  patch: jest.fn((url, data, config) => {
    const request = { method: "patch", url, data, config };
    requestHistory.push(request);

    // Check for predefined responses
    if (mockResponses.has(url)) {
      const response = mockResponses.get(url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve({ data: response, status: 200 });
    }

    // Default response
    return Promise.resolve({ data: {}, status: 200 });
  }),

  // Mock interceptors
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },

  // Test utility methods
  __setMockResponse: (url, response) => {
    mockResponses.set(url, response);
    return axiosMock;
  },
  __setMockError: (url, errorMessage) => {
    mockResponses.set(url, new Error(errorMessage));
    return axiosMock;
  },
  __getRequestHistory: () => [...requestHistory],
  __clearMockResponses: () => {
    mockResponses.clear();
    return axiosMock;
  },
  __clearRequestHistory: () => {
    requestHistory.length = 0;
    return axiosMock;
  },
  __resetAllMocks: () => {
    mockResponses.clear();
    requestHistory.length = 0;
    Object.values(axiosMock)
      .filter((value) => typeof value === "function" && value.mockClear)
      .forEach((mockFn) => mockFn.mockClear());
    return axiosMock;
  },
};

// Set defaults
axiosMock.defaults = {
  headers: {
    common: {
      "Content-Type": "application/json",
    },
  },
  baseURL: "",
  timeout: 0,
};

module.exports = axiosMock;
