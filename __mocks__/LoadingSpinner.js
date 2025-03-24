/**
 * Mock for LoadingSpinner component
 */
module.exports = {
  __esModule: true,
  default: function MockLoadingSpinner(props) {
    return { type: "div", props: { "data-testid": "mock-loading-spinner", ...props } };
  },
};
