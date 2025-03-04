import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import taskRoutes from './routes/taskRoutes';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import redisClient from './config/redis';

const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected',
    redis: redisClient.status === 'ready' ? 'Connected' : 'Disconnected',
  };
  res.json(healthcheck);
});

// Routes
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Uygulama hatası', { error: err });
  res.status(500).json({
    message: 'Bir hata oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

// Initialize Database
AppDataSource.initialize()
  .then(() => {
    logger.info('Veritabanı bağlantısı başarılı');
  })
  .catch((error) => {
    logger.error('Veritabanı bağlantı hatası:', error);
  });

export default app;
