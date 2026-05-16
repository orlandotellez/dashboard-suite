import { FastifyInstance } from 'fastify'
import { contactsController } from './contacts.controller.js'
import { authMiddleware } from '@/presentation/middlewares/auth.js'
import { rbacMiddleware } from '@/presentation/middlewares/rbac.js'

export const contactsRoutes = async (app: FastifyInstance) => {
  // All routes require authentication
  app.addHook('onRequest', authMiddleware)

  // List contacts
  app.get(
    '/',
    { preHandler: rbacMiddleware('contacts:read') },
    contactsController.findAll
  )

  // Get single contact
  app.get(
    '/:id',
    { preHandler: rbacMiddleware('contacts:read') },
    contactsController.findById
  )

  // Create contact
  app.post(
    '/',
    { preHandler: rbacMiddleware('contacts:create') },
    contactsController.create
  )

  // Update contact
  app.put(
    '/:id',
    { preHandler: rbacMiddleware('contacts:update') },
    contactsController.update
  )

  // Delete contact
  app.delete(
    '/:id',
    { preHandler: rbacMiddleware('contacts:delete') },
    contactsController.delete
  )
}
