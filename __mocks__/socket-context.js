const React = require("react");

// Mock SocketContext
const mockSocketState = {
  socket: {
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
  isConnected: true,
  connect: jest.fn(),
  disconnect: jest.fn(),
};

const SocketContext = React.createContext(mockSocketState);
SocketContext.displayName = "SocketContext";

// Socket Provider component
const SocketProvider = ({ children, value = mockSocketState }) => {
  return React.createElement(SocketContext.Provider, { value }, children);
};

// Custom hook for consuming Socket Context
const useSocket = () => React.useContext(SocketContext);

module.exports = {
  SocketContext,
  SocketProvider,
  useSocket,
  mockSocketState,
};
