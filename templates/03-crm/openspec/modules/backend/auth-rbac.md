# Auth & RBAC - Middlewares de Seguridad

## src/presentation/middlewares/auth.ts

```typescript
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';

export const registerAuth = async (app: FastifyInstance) => {
    // Register JWT plugin
    await app.register(fastifyJwt, {
        secret: {
            public: env.JWT_SECRET,
            private: env.JWT_SECRET,
            refresh: env.JWT_REFRESH_SECRET,
        },
        sign: {
            expiresIn: '15m', // 15 minutes
        },
    });

    // Decorate Fastify instance with authenticate function
    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    });
};

// Type augmentation for Fastify
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}
```

---

## src/presentation/middlewares/rbac.ts

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../../core/errors/AppError.js';

export type Role = 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'SOLO_LECTURA';

const ROLE_HIERARCHY: Record<Role, number> = {
    ADMIN: 4,
    MANAGER: 3,
    VENDEDOR: 2,
    SOLO_LECTURA: 1,
};

// Require specific roles
export const requireRoles = (roles: Role[]) => {
    return async (_request: FastifyRequest, _reply: FastifyReply) => {
        const request = _request as FastifyRequest & { user?: { role?: Role } };
        const user = request.user;

        if (!user || !user.role) {
            throw new UnauthorizedError('User not authenticated');
        }

        if (!roles.includes(user.role)) {
            throw new ForbiddenError('Insufficient permissions');
        }
    };
};

// Require minimum role level
export const requireMinRole = (minRole: Role) => {
    return async (_request: FastifyRequest, _reply: FastifyReply) => {
        const request = _request as FastifyRequest & { user?: { role?: Role } };
        const user = request.user;

        if (!user || !user.role) {
            throw new UnauthorizedError('User not authenticated');
        }

        if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
            throw new ForbiddenError('Insufficient permissions');
        }
    };
};

// Permission check helper
export const hasPermission = (
    userRole: Role,
    requiredRoles: Role[]
): boolean => {
    return requiredRoles.includes(userRole);
};

// Module permissions mapping
export const MODULE_PERMISSIONS: Record<string, Role[]> = {
    // Dashboard - all authenticated users
    dashboard: ['ADMIN', 'MANAGER', 'VENDEDOR', 'SOLO_LECTURA'],

    // Pipeline - all except SOLO_LECTURA can CRUD
    pipeline: ['ADMIN', 'MANAGER', 'VENDEDOR'],
    pipeline_read: ['ADMIN', 'MANAGER', 'VENDEDOR', 'SOLO_LECTURA'],

    // Contacts - ADMIN/MANAGER full, VENDEDOR own only
    contacts: ['ADMIN', 'MANAGER'],
    contacts_read_own: ['VENDEDOR'],
    contacts_read_all: ['ADMIN', 'MANAGER'],

    // Tasks
    tasks: ['ADMIN', 'MANAGER', 'VENDEDOR'],
    tasks_read_own: ['VENDEDOR'],

    // Emails
    emails: ['ADMIN', 'MANAGER'],
    emails_read: ['VENDEDOR', 'SOLO_LECTURA'],

    // Calendar
    calendar: ['ADMIN', 'MANAGER', 'VENDEDOR', 'SOLO_LECTURA'],

    // Reports
    reports: ['ADMIN', 'MANAGER'],
    reports_read_own: ['VENDEDOR', 'SOLO_LECTURA'],

    // Automations
    automations: ['ADMIN', 'MANAGER'],
    automations_read: ['ADMIN'],

    // Team
    team: ['ADMIN'],
    team_read: ['ADMIN', 'MANAGER'],

    // Products
    products: ['ADMIN', 'MANAGER'],
    products_read: ['ADMIN', 'MANAGER', 'VENDEDOR', 'SOLO_LECTURA'],

    // Documents
    documents: ['ADMIN', 'MANAGER', 'VENDEDOR'],
    documents_read: ['ADMIN', 'MANAGER', 'VENDEDOR', 'SOLO_LECTURA'],
};
```

---

## Tipos de Usuario (src/types/index.ts)

```typescript
export type Role = 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'SOLO_LECTURA';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatar?: string;
    avatarColor?: string;
    team?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithoutPassword extends User {
    // same as User but without password
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: Role;
}

export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```