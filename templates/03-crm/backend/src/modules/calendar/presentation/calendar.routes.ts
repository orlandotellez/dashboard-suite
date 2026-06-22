import { authMiddleware } from '@/presentation/middlewares/auth'
import { FastifyInstance } from 'fastify'

export const calendarRoutes = async (app: FastifyInstance) => {
  app.addHook('onRequest', authMiddleware)

  app.get('/', async () => ({ success: true, data: [] }))
  app.get('/:id', async () => ({ success: true, data: {} }))
  app.post('/', async () => ({ success: true, data: {} }))
  app.put('/:id', async () => ({ success: true, data: {} }))
  app.delete('/:id', async () => ({ success: true }))
}
