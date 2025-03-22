const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

require('dotenv').config({ path: '.env.test' });
require('@testing-library/jest-dom');

// Set global timeout
jest.setTimeout(60000);

// Check if we should skip MongoDB setup
const shouldSkipMongo = process.env.SKIP_MONGO === 'true';

if (!shouldSkipMongo) {
  console.log('Setting up MongoDB for tests');
  // Instead of requiring the file, we'll set up the necessary globals manually
  // This avoids Jest's automatic loading of the file which can cause timing issues
  
  // Mock MongoDB methods that can be used in tests
  global.mongoTestUtils = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    clear: jest.fn()
  };
  
  // These globals would normally be set by mongodb.setup.js
  global.__MONGO_URI__ = 'mongodb://localhost:27017/test-db';
  global.__MONGO_DB_NAME__ = 'jest';
} else {
  console.log('Skipping MongoDB setup for this test');
  
  // Create mock MongoDB functions for tests that don't need real MongoDB
  global.mongoTestUtils = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    clear: jest.fn()
  };
}

// Mock fetch
const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    return { type: 'img', props: { ...props } };
  }
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Route: ({ children }) => children,
  Routes: ({ children }) => children,
  Link: ({ children, to }) => children,
  NavLink: ({ children, to }) => children,
  Navigate: ({ to }) => null,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  MemoryRouter: ({ children }) => children
}));

// Mock react-big-calendar
jest.mock('react-big-calendar', () => ({
  __esModule: true,
  default: function Calendar(props) {
    return { type: 'div', props: { ...props, 'data-testid': 'calendar' } };
  },
  Views: {
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day'
  }
}));

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: function LineChart(props) {
    return { type: 'div', props: { ...props, 'data-testid': 'line-chart' } };
  },
  Line: () => null,
  BarChart: function BarChart(props) {
    return { type: 'div', props: { ...props, 'data-testid': 'bar-chart' } };
  },
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => children
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { id: '1' } })),
  signIn: jest.fn(),
  signOut: jest.fn()
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams()
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }))
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    patient: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    appointment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    availability: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }))
}));

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console.error for specific React warnings
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: useLayoutEffect does nothing on the server/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock console.error to fail tests
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: ReactDOM.hydrate is no longer supported in React 18/.test(args[0]) ||
    /Warning: ReactDOM.unmountComponentAtNode is no longer supported in React 18/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
);

// Mock WebSocket
global.WebSocket = class {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
  }
  send(data) {}
  close() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Define global mocks for contexts
global.AuthContext = {
  Provider: ({ children }) => children
};

global.SocketContext = {
  Provider: ({ children }) => children
};

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';