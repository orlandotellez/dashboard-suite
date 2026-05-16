import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authController } from './auth.controller.js'
import { authMiddleware } from '@/presentation/middlewares/auth.js'
import { rbacMiddleware } from '@/presentation/middlewares/rbac.js'

export const authRoutes = async (app: FastifyInstance) => {
  // Public routes
  app.post('/login', authController.login)
  app.post('/register', authController.register)
  app.post('/refresh-token', authController.refreshToken)
  app.post('/logout', authController.logout)

  // Protected routes
  app.get(
    '/me',
    { preHandler: [authMiddleware, rbacMiddleware('auth:read')] },
    authController.me
  )

  app.post(
    '/change-password',
    { preHandler: [authMiddleware, rbacMiddleware('auth:read')] },
    authController.changePassword
  )
}
