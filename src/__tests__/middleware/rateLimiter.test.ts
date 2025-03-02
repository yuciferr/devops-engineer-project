import { apiLimiter } from '../../middleware/rateLimiter';

jest.mock('../../utils/logger', () => ({
  warn: jest.fn()
}));

describe('Rate Limiter Middleware', () => {
  it('should be configured correctly', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
  });

  it('should be a middleware function', () => {
    expect(apiLimiter.length).toBe(3); // req, res, next parametreleri
  });
}); 