import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../config/database';

describe('App', () => {
  beforeAll(async () => {
    // Veritabanı bağlantısını başlat
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Veritabanı bağlantısını kapat
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('GET /health', () => {
    it('should return health check info', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'OK',
        database: expect.any(String),
        redis: expect.any(String),
        uptime: expect.any(Number),
        timestamp: expect.any(Number),
      });
    });
  });
});
