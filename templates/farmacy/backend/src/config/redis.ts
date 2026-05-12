import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../infrastructure/logger.js';

const redisConfig = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null,
    reconnectOnError: () => false,
};

export const redis = new Redis(redisConfig);

redis.on('error', (err) => {
    // Silenciar errores - Redis es opcional
});

export const isRedisConnected = () => redis.status === 'ready';