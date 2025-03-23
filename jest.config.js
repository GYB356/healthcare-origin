export default {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '^react-router-dom$': '<rootDir>/__mocks__/react-router-dom.js',
    '^recharts$': '<rootDir>/__mocks__/recharts.js',
    '^react-big-calendar$': '<rootDir>/__mocks__/react-big-calendar.js',
    '@testing-library/jest-dom/extend-expect': '<rootDir>/__mocks__/@testing-library/jest-dom/extend-expect.js',
    '(.*)/contexts/AuthContext': '<rootDir>/__mocks__/auth-context.js',
    '(.*)/context/AuthContext': '<rootDir>/__mocks__/auth-context.js',
    '(.*)/contexts/SocketContext': '<rootDir>/__mocks__/socket-context.js',
    '(.*)/context/SocketContext': '<rootDir>/__mocks__/socket-context.js',
    '^@chakra-ui/react$': '<rootDir>/__mocks__/chakra-ui-react.js',
    '^@chakra-ui/icons$': '<rootDir>/__mocks__/chakra-ui-icons.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  setupFilesAfterEnv: [
    './jest.setup.js'
  ],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(mongodb-memory-server|mongodb-memory-server-core|express|socket.io|@playwright/test)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
    '/__tests__/(api|components|lib)/',
    '/vitest/'
  ],
  testTimeout: 120000
};