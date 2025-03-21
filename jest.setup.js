require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
const fetchMock = require('jest-fetch-mock');

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch
fetchMock.enableMocks();

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  }
}));

// Mock next/auth
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: jest.fn(() => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'DOCTOR'
    }
  }))
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {}
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
    join: jest.fn(),
    leave: jest.fn()
  };
  return {
    io: jest.fn(() => mockSocket),
    connect: jest.fn(() => mockSocket)
  };
});

// Mock http server
jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn((port, callback) => callback && callback()),
    close: jest.fn((callback) => callback && callback()),
    address: jest.fn(() => ({ port: 3001 }))
  }))
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      patient: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      appointment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      availability: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

// Increase timeout for all tests
jest.setTimeout(30000);

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 