module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test|integration.test).ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.integration.test.ts',
    '!src/__tests__/setup.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true
}; 