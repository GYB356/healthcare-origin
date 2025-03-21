// Create a manual mock for axios
const axiosMock = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn().mockReturnThis(),
  defaults: {
    headers: {
      common: {},
      post: {},
      get: {}
    }
  }
};

// Add mock implementation helpers to each method
['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
  axiosMock[method].mockResolvedValue = value => axiosMock[method].mockImplementation(() => Promise.resolve(value));
  axiosMock[method].mockResolvedValueOnce = value => axiosMock[method].mockImplementationOnce(() => Promise.resolve(value));
  axiosMock[method].mockRejectedValue = error => axiosMock[method].mockImplementation(() => Promise.reject(error));
  axiosMock[method].mockRejectedValueOnce = error => axiosMock[method].mockImplementationOnce(() => Promise.reject(error));
});

module.exports = axiosMock; 