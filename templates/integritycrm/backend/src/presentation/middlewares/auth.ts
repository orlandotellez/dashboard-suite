import { UnauthorizedError } from '@/core/errors/AppError'
import { FastifyRequest, FastifyReply } from 'fastify'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
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

    const token = authHeader.slice(7)

    const decoded = await request.jwtVerify<{
      sub: string
      email: string
      name: string
      role: string
    }>()

    request.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
