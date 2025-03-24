/**
 * Centralized Mock Registry
 *
 * This file serves as a central registry for all mocks used in tests.
 * It provides a structured way to manage mocks and ensures consistency.
 */

const React = require("react");

// Mock registry - maps component paths to their mocks
const mockRegistry = {
  // UI Components
  "components/ReportViewer": {
    __esModule: true,
    default: function MockReportViewer(props) {
      return { type: "div", props: { "data-testid": "mock-report-viewer", ...props } };
    },
  },
  "@/components/common/LoadingSpinner": {
    __esModule: true,
    default: function MockLoadingSpinner() {
      return { type: "div", props: { "data-testid": "mock-loading-spinner" } };
    },
  },

  // Contexts
  "@/contexts/AuthContext": require("./auth-context.js"),
  "@/context/AuthContext": require("./auth-context.js"),
  "contexts/AuthContext": require("./auth-context.js"),
  "context/AuthContext": require("./auth-context.js"),

  // Libraries
  axios: require("./axios.js"),
  "react-router-dom": require("./react-router-dom.js"),

  // Utilities
  "@/utils/validation": {
    validateLoginData: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
  },
};

/**
 * Register a mock with Jest
 * @param {string} path - The module path to mock
 * @param {object} mock - The mock implementation
 * @param {object} options - Options for jest.mock
 * @returns {object} The registered mock
 */
function registerMock(path, mock, options = { virtual: true }) {
  jest.mock(path, () => mock, options);
  return mock;
}

/**
 * Register all mocks in the registry
 */
function registerAllMocks() {
  Object.entries(mockRegistry).forEach(([path, mock]) => {
    registerMock(path, mock);
  });
}

// Export the registry and helper functions
module.exports = {
  mockRegistry,
  registerMock,
  registerAllMocks,
};
