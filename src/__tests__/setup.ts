import 'reflect-metadata';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(async () => {
  jest.clearAllMocks();
}); 