import { ForbiddenError } from '@/core/errors/AppError'
import { FastifyRequest, FastifyReply } from 'fastify'

type Role = 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'STAFF' | 'SOLO_LECTURA'

type Permission =
  | 'auth:read'
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete'
  | 'contacts:create' | 'contacts:read' | 'contacts:update' | 'contacts:delete'
  | 'deals:create' | 'deals:read' | 'deals:update' | 'deals:delete'
  | 'tasks:create' | 'tasks:read' | 'tasks:update' | 'tasks:delete'
  | 'emails:create' | 'emails:read' | 'emails:update' | 'emails:delete'
  | 'calendar:create' | 'calendar:read' | 'calendar:update' | 'calendar:delete'
  | 'products:create' | 'products:read' | 'products:update' | 'products:delete'
  | 'documents:create' | 'documents:read' | 'documents:update' | 'documents:delete'
  | 'automations:create' | 'automations:read' | 'automations:update' | 'automations:delete'
  | 'reports:read'
  | 'team:create' | 'team:read' | 'team:update' | 'team:delete'

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    'auth:read',
    'users:create', 'users:read', 'users:update', 'users:delete',
    'contacts:create', 'contacts:read', 'contacts:update', 'contacts:delete',
    'deals:create', 'deals:read', 'deals:update', 'deals:delete',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
    'emails:create', 'emails:read', 'emails:update', 'emails:delete',
    'calendar:create', 'calendar:read', 'calendar:update', 'calendar:delete',
    'products:create', 'products:read', 'products:update', 'products:delete',
    'documents:create', 'documents:read', 'documents:update', 'documents:delete',
    'automations:create', 'automations:read', 'automations:update', 'automations:delete',
    'reports:read',
    'team:create', 'team:read', 'team:update', 'team:delete',
  ],
  MANAGER: [
    'auth:read',
    'users:read',
    'contacts:create', 'contacts:read', 'contacts:update', 'contacts:delete',
    'deals:create', 'deals:read', 'deals:update', 'deals:delete',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
    'emails:read',
    'calendar:read',
    'products:read',
    'documents:create', 'documents:read', 'documents:update', 'documents:delete',
    'automations:read',
    'reports:read',
    'team:read',
  ],
  VENDEDOR: [
    'auth:read',
    'contacts:create', 'contacts:read',
    'deals:create', 'deals:read', 'deals:update',
    'tasks:create', 'tasks:read', 'tasks:update',
    'emails:create', 'emails:read',
    'calendar:create', 'calendar:read',
    'products:read',
    'documents:create', 'documents:read',
    'reports:read',
    'team:read',
  ],
  STAFF: [
    'auth:read',
    'contacts:read',
    'deals:read',
    'tasks:read',
    'emails:read',
    'calendar:read',
    'products:read',
    'documents:read',
    'team:read',
  ],
  SOLO_LECTURA: [
    'auth:read',
    'contacts:read',
    'deals:read',
    'tasks:read',
    'emails:read',
    'calendar:read',
    'products:read',
    'documents:read',
    'reports:read',
    'team:read',
  ],
}

export const rbacMiddleware = (...requiredPermissions: Permission[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user

    if (!user) {
      throw new ForbiddenError('User not authenticated')
    }

    const userRole = user.role as Role
    const userPermissions = rolePermissions[userRole] || []

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions')
    }
  }
}
