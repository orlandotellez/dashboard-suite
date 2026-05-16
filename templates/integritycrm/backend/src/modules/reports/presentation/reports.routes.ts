import { authMiddleware } from '@/presentation/middlewares/auth'
import { FastifyInstance } from 'fastify'

export const reportsRoutes = async (app: FastifyInstance) => {
  app.addHook('onRequest', authMiddleware)

  app.get('/pipeline', async () => ({ success: true, data: {} }))
  app.get('/sales', async () => ({ success: true, data: {} }))
  app.get('/team', async () => ({ success: true, data: {} }))
  app.get('/activities', async () => ({ success: true, data: {} }))
}
