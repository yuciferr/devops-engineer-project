import 'reflect-metadata';
import redisClient from '../config/redis';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(async () => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(async () => {
  await redisClient.quit();
  await new Promise(resolve => setTimeout(resolve, 500)); // Redis bağlantısının kapanması için bekle
}); 