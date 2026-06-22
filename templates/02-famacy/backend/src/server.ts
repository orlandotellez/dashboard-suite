import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger.js';
import { prisma } from './config/prisma.js';
import { redis } from './config/redis.js';

const startServer = async () => {
  try {
    const app = await buildApp();

    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);

    const gracefulShutdown = async (signal: string) => {
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
