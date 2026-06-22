import { FastifyInstance } from 'fastify'
import { authRoutes } from '../modules/auth/presentation/auth.routes.js'
import { usersRoutes } from '../modules/users/presentation/users.routes.js'
import { contactsRoutes } from '../modules/contacts/presentation/contacts.routes.js'
import { dealsRoutes } from '../modules/deals/presentation/deals.routes.js'
import { tasksRoutes } from '../modules/tasks/presentation/tasks.routes.js'
import { emailsRoutes } from '../modules/emails/presentation/emails.routes.js'
import { calendarRoutes } from '../modules/calendar/presentation/calendar.routes.js'
import { productsRoutes } from '../modules/products/presentation/products.routes.js'
import { documentsRoutes } from '../modules/documents/presentation/documents.routes.js'
import { automationsRoutes } from '../modules/automations/presentation/automations.routes.js'
import { reportsRoutes } from '../modules/reports/presentation/reports.routes.js'
import { teamRoutes } from '../modules/team/presentation/team.routes.js'

export const routes = async (fastify: FastifyInstance, options: any) => {
  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(usersRoutes, { prefix: '/users' })
  fastify.register(contactsRoutes, { prefix: '/contacts' })
  fastify.register(dealsRoutes, { prefix: '/deals' })
  fastify.register(tasksRoutes, { prefix: '/tasks' })
  fastify.register(emailsRoutes, { prefix: '/emails' })
  fastify.register(calendarRoutes, { prefix: '/calendar' })
  fastify.register(productsRoutes, { prefix: '/products' })
  fastify.register(documentsRoutes, { prefix: '/documents' })
  fastify.register(automationsRoutes, { prefix: '/automations' })
  fastify.register(reportsRoutes, { prefix: '/reports' })
  fastify.register(teamRoutes, { prefix: '/team' })
}
