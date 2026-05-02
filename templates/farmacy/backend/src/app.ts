const fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const compress = require('@fastify/compress');
const rateLimit = require('@fastify/rate-limit');
const { env } = require('./config/env');
const { errorHandler } = require('./presentation/middlewares/errorHandler');
const { registerAuth } = require('./presentation/middlewares/auth');
const { routes } = require('./presentation/routes');

const buildApp = async () => {
    const app = fastify({
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

module.exports = { buildApp };
