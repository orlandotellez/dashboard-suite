import Redis from 'ioredis'
import { config } from './env.js'

let redisClient: Redis | null = null

export const getRedisClient = () => {
  if (redisClient) return redisClient

  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectionName: 'integritycrm',
    })

    redisClient.on('error', (err) => {
      console.warn('Redis connection error (non-fatal):', err.message)
    })

    return redisClient
  } catch (error) {
    console.warn('Redis unavailable, continuing without cache')
    return null
  }
}

export const redis = getRedisClient()