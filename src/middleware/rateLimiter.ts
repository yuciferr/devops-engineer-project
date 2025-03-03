import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis';
import logger from '../utils/logger';

export const apiLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error Redis tip uyumsuzluğu
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına limit
  message: {
    status: 429,
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
  },
  handler: (
    req: Request,
    res: Response,
    _next: NextFunction,
    options: { statusCode: number; message: string }
  ) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(options.statusCode).json(options.message);
  },
});
