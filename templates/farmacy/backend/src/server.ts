const { buildApp } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./infrastructure/logger');
const { prisma } = require('./config/prisma');
const { redis } = require('./config/redis');

const startServer = async () => {
    try {
        const app = await buildApp();

        await app.listen({ port: env.PORT, host: '0.0.0.0' });

        logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);

        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            await app.close();
            await prisma.$disconnect();
            redis.disconnect();
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};

startServer();
