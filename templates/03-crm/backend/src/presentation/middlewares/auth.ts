import { UnauthorizedError } from '@/core/errors/AppError'
import { FastifyRequest, FastifyReply } from 'fastify'
import { checkTokenBlacklist } from '@/infrastructure/auth/tokenBlacklist.js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  jti?: string // JWT ID for blacklist checking
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    const decoded = await request.jwtVerify<{
      sub: string
      email: string
      name: string
      role: string
      jti?: string
    }>()

    // Check if token is blacklisted
    if (decoded.jti) {
      const isRevoked = await checkTokenBlacklist(decoded.jti, decoded.sub)
      if (isRevoked) {
        throw new UnauthorizedError('Token has been revoked')
      }
    }

    request.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      jti: decoded.jti,
    }
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
