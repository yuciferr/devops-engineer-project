import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 20) {
      return null; // Yeniden denemeyi durdur
    }
    return Math.min(times * 100, 3000); // Her denemede artan bekleme süresi
  },
  maxRetriesPerRequest: 3, // Her istek için maksimum yeniden deneme sayısı
  connectTimeout: 10000, // Bağlantı zaman aşımı (10 saniye)
  enableReadyCheck: true,
  showFriendlyErrorStack: true,
});

redisClient.on('error', (error) => {
  console.error('Redis bağlantı hatası:', error);
});

redisClient.on('connect', () => {
  console.log('Redis bağlantısı başarılı');
});

export default redisClient;
