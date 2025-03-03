import 'reflect-metadata';
import redisClient from '../config/redis';
import { AppDataSource } from '../config/database';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(async () => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(async () => {
  // Redis bağlantısını kapat
  await redisClient.quit();
  
  // PostgreSQL bağlantısını kapat
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  
  // Bağlantıların tamamen kapanması için bekle
  await new Promise(resolve => setTimeout(resolve, 500));
}); 