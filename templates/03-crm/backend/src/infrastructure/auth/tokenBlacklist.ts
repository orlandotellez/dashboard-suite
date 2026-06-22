import { redis } from '@/config/redis.js'

// TTL for blacklisted tokens (7 days - same as refresh token)
const BLACKLIST_TTL = 7 * 24 * 60 * 60

const BLACKLIST_PREFIX = 'blacklist'

// Token blacklist service using Redis, Used to invalidate tokens when user logs out or admin revokes access
export const tokenBlacklist = {
  /**
   * Add a token to the blacklist
   * @param tokenId - JWT ID (jti) or the token itself
   */
  async add(tokenId: string): Promise<boolean> {
    if (!redis) return false

    try {
      const key = `${BLACKLIST_PREFIX}:${tokenId}`
      await redis.setex(key, BLACKLIST_TTL, '1')
      return true
    } catch (error) {
      console.warn('Failed to blacklist token:', error)
      return false
    }
  },

  // Check if a token is blacklisted
  async isBlacklisted(tokenId: string): Promise<boolean> {
    if (!redis) return false

    try {
      const key = `${BLACKLIST_PREFIX}:${tokenId}`
      const result = await redis.get(key)
      return result === '1'
    } catch (error) {
      console.warn('Failed to check blacklist:', error)
      return false
    }
  },

  // Remove a token from the blacklist (before expiry)
  async remove(tokenId: string): Promise<boolean> {
    if (!redis) return false

    try {
      const key = `${BLACKLIST_PREFIX}:${tokenId}`
      await redis.del(key)
      return true
    } catch (error) {
      console.warn('Failed to remove from blacklist:', error)
      return false
    }
  },

  // Get remaining TTL for a blacklisted token
  async getRemainingTTL(tokenId: string): Promise<number> {
    if (!redis) return 0

    try {
      const key = `${BLACKLIST_PREFIX}:${tokenId}`
      const ttl = await redis.ttl(key)
      return ttl > 0 ? ttl : 0
    } catch {
      return 0
    }
  },

  // Revoke all tokens for a user (logout from all devices)
  async revokeUserTokens(userId: string): Promise<boolean> {
    if (!redis) return false

    try {
      // Store a user-level revocation marker
      const key = `${BLACKLIST_PREFIX}:user:${userId}`
      await redis.setex(key, BLACKLIST_TTL, '1')
      return true
    } catch (error) {
      console.warn('Failed to revoke user tokens:', error)
      return false
    }
  },

  // Check if user has any revoked tokens
  async isUserRevoked(userId: string): Promise<boolean> {
    if (!redis) return false

    try {
      const key = `${BLACKLIST_PREFIX}:user:${userId}`
      const result = await redis.get(key)
      return result === '1'
    } catch {
      return false
    }
  },
}

// Middleware to check token blacklist
export const checkTokenBlacklist = async (
  tokenId: string,
  userId: string
): Promise<boolean> => {
  // Check individual token
  if (tokenId) {
    const isBlacklisted = await tokenBlacklist.isBlacklisted(tokenId)
    if (isBlacklisted) return true
  }

  // Check user-level revocation
  const isUserRevoked = await tokenBlacklist.isUserRevoked(userId)
  return isUserRevoked
}
