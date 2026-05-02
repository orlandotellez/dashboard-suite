const { Redis } = require('ioredis');
const { env } = require('./env');
const { logger } = require('../infrastructure/logger');

const redisConfig = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null,
    reconnectOnError: () => false,
};

const redis = new Redis(redisConfig);

redis.on('error', (err) => {
    // Silenciar errores - Redis es opcional
});

const isRedisConnected = () => redis.status === 'ready';

module.exports = { redis, isRedisConnected };
