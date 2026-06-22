import { FastifyRequest, FastifyReply } from 'fastify'
import { redis } from '@/config/redis.js'

export interface RateLimitOptions {
  max: number // Max requests
  windowMs: number // Time window in ms
  keyPrefix?: string // Prefix for Redis key
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  max: 100,
  windowMs: 60000, // 1 minute
  keyPrefix: 'ratelimit',
}

/**
 * Rate limiter using Redis sliding window algorithm
 * Falls back to in-memory if Redis is unavailable
 */
export const createRateLimiter = (options: RateLimitOptions = DEFAULT_OPTIONS) => {
  const { max, windowMs, keyPrefix } = { ...DEFAULT_OPTIONS, ...options }
  const windowSeconds = Math.ceil(windowMs / 1000)

  // In-memory fallback when Redis is unavailable
  const inMemoryCache = new Map<string, { count: number; resetTime: number }>()

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const identifier = request.ip || 'unknown'
    const key = `${keyPrefix}:${identifier}`

    try {
      if (redis) {
        // Redis-based rate limiting
        const current = await redis.get(key)
        const count = current ? parseInt(current, 10) : 0

        if (count >= max) {
          const ttl = await redis.ttl(key)
          reply.code(429).send({
            success: false,
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil(ttl)} seconds.`,
            retryAfter: ttl > 0 ? ttl : windowSeconds,
          })
          return
        }

        // Increment with atomic operation
        const pipeline = redis.pipeline()
        pipeline.incr(key)
        if (count === 0) {
          pipeline.expire(key, windowSeconds)
        }
        await pipeline.exec()
      } else {
        // In-memory fallback
        const now = Date.now()
        const record = inMemoryCache.get(key)

        if (!record || now > record.resetTime) {
          // First request in window or window expired
          inMemoryCache.set(key, {
            count: 1,
            resetTime: now + windowMs,
          })
        } else if (record.count >= max) {
          // Rate limit exceeded
          const retryAfter = Math.ceil((record.resetTime - now) / 1000)
          reply.code(429).send({
            success: false,
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
          })
          return
        } else {
          // Increment count
          record.count++
        }
      }

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', max)
      reply.header('X-RateLimit-Remaining', max - (await getRemainingRequests(key)))
    } catch (error) {
      // If rate limiting fails, allow the request
      console.warn('Rate limiter error:', error)
    }
  }
}

/**
 * Get remaining requests for a key
 */
async function getRemainingRequests(key: string): Promise<number> {
  if (!redis) return 0

  try {
    const current = await redis.get(key)
    return current ? Math.max(0, DEFAULT_OPTIONS.max - parseInt(current, 10)) : DEFAULT_OPTIONS.max
  } catch {
    return DEFAULT_OPTIONS.max
  }
}

/**
 * Clear rate limit for an identifier (for testing or admin reset)
 */
export const clearRateLimit = async (identifier: string): Promise<boolean> => {
  if (!redis) return false

  try {
    await redis.del(`ratelimit:${identifier}`)
    return true
  } catch (error) {
    console.warn('Failed to clear rate limit:', error)
    return false
  }
}

/**
 * Pre-configured rate limiters for different routes
 */
export const rateLimiters = {
  // Strict: 10 requests per minute (e.g., auth endpoints)
  strict: createRateLimiter({ max: 10, windowMs: 60000, keyPrefix: 'ratelimit:strict' }),

  // Standard: 60 requests per minute (most API endpoints)
  standard: createRateLimiter({ max: 60, windowMs: 60000, keyPrefix: 'ratelimit:standard' }),

  // Relaxed: 200 requests per minute (read-only endpoints)
  relaxed: createRateLimiter({ max: 200, windowMs: 60000, keyPrefix: 'ratelimit:relaxed' }),
}