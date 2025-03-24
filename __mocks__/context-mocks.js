// Mock for AuthContext
const AuthContext = {
  Provider: ({ children, value }) => children,
};

// Mock for SocketContext
const SocketContext = {
  Provider: ({ children, value }) => children,
};

// Export the mocks
module.exports = {
  AuthContext,
  SocketContext,
};
