import IORedis from 'ioredis';
import { env } from '../config/env';

/**
 * Shared Redis connection options for BullMQ & Caching
 */
export const redisConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
};

export const redisClient = new IORedis(redisConnectionOptions);

redisClient.on('connect', () => {
  if (env.NODE_ENV !== 'test') {
    console.log('⚡ Connected to Redis at', `${env.REDIS_HOST}:${env.REDIS_PORT}`);
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});
