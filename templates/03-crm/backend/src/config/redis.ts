import Redis from 'ioredis'
import { config } from './env.js'

let redisClient: Redis | null = null

export const getRedisClient = () => {
  if (redisClient) return redisClient

  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: false, // Changed to false to connect immediately
      connectionName: 'integritycrm',
    })

    // Connect and log status
    redisClient.connect().then(() => {
      console.log('✅ Redis connected successfully')
    }).catch((err) => {
      console.warn('⚠️ Redis connection failed:', err.message)
    })

    redisClient.on('error', (err) => {
      console.warn('Redis connection error (non-fatal):', err.message)
    })

    redisClient.on('connect', () => {
      console.log('Redis: Connection established')
    })

    return redisClient
  } catch (error) {
    console.warn('Redis unavailable, continuing without cache')
    return null
  }
}

export const redis = getRedisClient()