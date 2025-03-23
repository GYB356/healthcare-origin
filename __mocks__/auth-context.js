const React = require('react');

// Mock AuthContext
const mockAuthState = {
  isAuthenticated: true,
  user: {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin'
  },
  login: jest.fn(() => Promise.resolve({ success: true })),
  logout: jest.fn(),
  register: jest.fn(() => Promise.resolve({ success: true })),
  loading: false,
  error: null
};

const AuthContext = React.createContext(mockAuthState);
AuthContext.displayName = 'AuthContext';

// Auth Provider component
const AuthProvider = ({ children, value = mockAuthState }) => {
  return React.createElement(AuthContext.Provider, { value }, children);
};

// Custom hook for consuming Auth Context
const useAuth = () => React.useContext(AuthContext);

module.exports = {
  AuthContext,
  AuthProvider,
  useAuth,
  mockAuthState
}; 