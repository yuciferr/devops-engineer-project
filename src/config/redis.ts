import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (error) => {
  console.error('Redis bağlantı hatası:', error);
});

redisClient.on('connect', () => {
  console.log('Redis bağlantısı başarılı');
});

export default redisClient;
