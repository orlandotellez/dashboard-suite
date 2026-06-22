import { redis } from '../config/redis.js'

const DEBUG = process.env.NODE_ENV === 'development'

export interface CacheOptions {
  ttl: number // Time to live in seconds
  prefix: string
}

//Generic cache service with graceful degradation, If Redis is unavailable, operations become no-op
export const cacheService = {
  // Get value from cache
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      DEBUG && console.log(`[CACHE] Redis not available, skipping get: ${key}`)
      return null
    }

    try {
      const cached = await redis.get(key)
      if (cached) {
        DEBUG && console.log(`[CACHE] HIT: ${key}`)
        return JSON.parse(cached)
      }
      DEBUG && console.log(`[CACHE] MISS: ${key}`)
      return null
    } catch (error) {
      console.warn('Cache get error:', error)
      return null
    }
  },

  // Set value in cache with TTL
  async set<T>(key: string, value: T, ttl: number): Promise<boolean> {
    if (!redis) {
      DEBUG && console.log(`[CACHE] Redis not available, skipping set: ${key}`)
      return false
    }

    try {
      await redis.setex(key, ttl, JSON.stringify(value))
      DEBUG && console.log(`[CACHE] SET: ${key} (TTL: ${ttl}s)`)
      return true
    } catch (error) {
      console.warn('Cache set error:', error)
      return false
    }
  },

  // Delete a single key
  async delete(key: string): Promise<boolean> {
    if (!redis) return false

    try {
      await redis.del(key)
      DEBUG && console.log(`[CACHE] DELETE: ${key}`)
      return true
    } catch (error) {
      console.warn('Cache delete error:', error)
      return false
    }
  },

  // Delete all keys matching a pattern
  async deletePattern(pattern: string): Promise<number> {
    if (!redis) return 0

    try {
      const keys = await redis.keys(pattern)
      if (keys.length === 0) return 0

      await redis.del(...keys)
      DEBUG && console.log(`[CACHE] DELETE_PATTERN: ${pattern} (${keys.length} keys)`)
      return keys.length
    } catch (error) {
      console.warn('Cache deletePattern error:', error)
      return 0
    }
  },

  // Check if a key exists
  async exists(key: string): Promise<boolean> {
    if (!redis) return false

    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      return false
    }
  },

  // Get and set pattern - get value, or fetch and cache if not exists
  async remember<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch from source
    const value = await fetchFn()

    // Cache the result
    await this.set(key, value, ttl)

    return value
  },
}

// Build a cache key with prefix
export const buildCacheKey = (prefix: string, ...parts: string[]): string => {
  return `${prefix}:${parts.join(':')}`
}

// Default TTL values
export const CACHE_TTL = {
  SHORT: 30, // 30 seconds - for frequently changing data
  MEDIUM: 60, // 1 minute - for dashboard stats
  LONG: 300, // 5 minutes - for catalogs, configurations
  VERY_LONG: 900, // 15 minutes - for almost static data
} as const
