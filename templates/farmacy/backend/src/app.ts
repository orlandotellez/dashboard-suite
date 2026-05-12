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