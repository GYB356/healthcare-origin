export default {
  testEnvironment: 'node',
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
    '@testing-library/jest-dom/extend-expect': '<rootDir>/__mocks__/@testing-library/jest-dom/extend-expect.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  setupFilesAfterEnv: [
    './jest.setup.js',
    './__tests__/helpers/mongodb.setup.js'
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
  testTimeout: 60000
};