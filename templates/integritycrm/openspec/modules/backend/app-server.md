# App & Server - Entry Points

## src/server.ts

```typescript
import { buildApp } from './app.js';

const start = async () => {
    try {
        const app = await buildApp();
        await app.listen({
            port: env.PORT,
            host: env.HOST,
        });
        app.log.info(`Server running on ${env.HOST}:${env.PORT}`);
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

start();
```

---

## src/app.ts

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './presentation/middlewares/errorHandler.js';
import { registerAuth } from './presentation/middlewares/auth.js';
import { routes } from './presentation/routes.js';

export const buildApp = async () => {
    const app = Fastify({
        logger: env.NODE_ENV === 'development'
            ? {
                level: 'debug',
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname',
                    },
                },
            }
            : {
                level: 'info',
            },
    });

    // Error Handler
    app.setErrorHandler(errorHandler);

    // Security and Utils
    await app.register(helmet);
    await app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });
    await app.register(compress);

    // Rate Limiting
    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
    });

    // JWT Auth (using dedicated middleware)
    await registerAuth(app);

    // Routes
    app.register(routes, { prefix: '/api/v1' });

    // Health check
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    return app;
};
```

---

## src/config/env.ts

```typescript
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    HOST: z.string().default('0.0.0.0'),

    // Database
    DATABASE_URL: z.string(),

    // JWT
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),

    // Redis
    REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
```

---

## src/config/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
});

prisma.$connect()
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err));

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
```

---

## src/config/redis.ts

```typescript
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

redis.on('connect', () => {
    console.log('Redis connected');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export const isRedisConnected = () => redis.status === 'ready';
```

---

## src/infrastructure/logger.ts

```typescript
import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
            },
        }
        : undefined,
});
```

---

## src/presentation/routes.ts

```typescript
import { FastifyInstance } from 'fastify';

import authRoutes from '../modules/auth/presentation/auth.routes.js';
import userRoutes from '../modules/users/presentation/user.routes.js';
import contactRoutes from '../modules/contacts/presentation/contact.routes.js';
import dealRoutes from '../modules/deals/presentation/deal.routes.js';
import taskRoutes from '../modules/tasks/presentation/task.routes.js';
import emailRoutes from '../modules/emails/presentation/email.routes.js';
import calendarRoutes from '../modules/calendar/presentation/calendar.routes.js';
import productRoutes from '../modules/products/presentation/product.routes.js';
import documentRoutes from '../modules/documents/presentation/document.routes.js';
import automationRoutes from '../modules/automations/presentation/automation.routes.js';
import reportRoutes from '../modules/reports/presentation/report.routes.js';
import teamRoutes from '../modules/team/presentation/team.routes.js';

export const routes = async (fastify: FastifyInstance) => {
    // Auth (public)
    await fastify.register(authRoutes, { prefix: '/auth' });

    // Protected routes
    await fastify.register(async (fastify) => {
        fastify.addHook('onRequest', fastify.authenticate);

        await fastify.register(userRoutes, { prefix: '/users' });
        await fastify.register(contactRoutes, { prefix: '/contacts' });
        await fastify.register(dealRoutes, { prefix: '/deals' });
        await fastify.register(taskRoutes, { prefix: '/tasks' });
        await fastify.register(emailRoutes, { prefix: '/emails' });
        await fastify.register(calendarRoutes, { prefix: '/calendar' });
        await fastify.register(productRoutes, { prefix: '/products' });
        await fastify.register(documentRoutes, { prefix: '/documents' });
        await fastify.register(automationRoutes, { prefix: '/automations' });
        await fastify.register(reportRoutes, { prefix: '/reports' });
        await fastify.register(teamRoutes, { prefix: '/team' });
    });
};
```