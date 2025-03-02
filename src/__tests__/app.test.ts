import request from 'supertest';
import app from '../app';

describe('App', () => {
  describe('GET /health', () => {
    it('should return health check info', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'OK',
        database: expect.any(String),
        redis: expect.any(String),
        uptime: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });
  });
}); 