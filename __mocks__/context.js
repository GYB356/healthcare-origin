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

// Mock SocketContext
const mockSocketState = {
  socket: {
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  },
  isConnected: true,
  connect: jest.fn(),
  disconnect: jest.fn()
};

const SocketContext = React.createContext(mockSocketState);
SocketContext.displayName = 'SocketContext';

// Socket Provider component
const SocketProvider = ({ children, value = mockSocketState }) => {
  return React.createElement(SocketContext.Provider, { value }, children);
};

// Custom hook for consuming Socket Context
const useSocket = () => React.useContext(SocketContext);

module.exports = {
  AuthContext,
  AuthProvider,
  useAuth,
  mockAuthState,
  SocketContext,
  SocketProvider,
  useSocket,
  mockSocketState
};