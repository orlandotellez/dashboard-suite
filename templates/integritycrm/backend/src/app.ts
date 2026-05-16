import Fastify, { FastifyInstance } from 'fastify'
import FastifyJwt from '@fastify/jwt'
import FastifyCors from '@fastify/cors'
import FastifyHelmet from '@fastify/helmet'
import FastifyCompress from '@fastify/compress'
import FastifyRateLimit from '@fastify/rate-limit'
import { config } from './config/env.js'
import { errorHandler } from './core/errors/AppError.js'
import { routes } from './presentation/routes.js'
import { logger } from './infrastructure/logger.js'

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
      transport: config.nodeEnv === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    trustProxy: true,
  })

  // Error handler
  app.setErrorHandler(errorHandler)

  // Security headers
  await app.register(FastifyHelmet, {
    contentSecurityPolicy: false,
  })

  // CORS
  await app.register(FastifyCors, {
    origin: true,
    credentials: true,
  })

  // Compression
  await app.register(FastifyCompress)

  // Rate limiting
  await app.register(FastifyRateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    keyGenerator: (request) => {
      return request.ip
    },
  })

  // JWT
  await app.register(FastifyJwt, {
    secret: {
      public: config.jwt.secret,
      private: config.jwt.secret,
    },
    sign: {
      expiresIn: config.jwt.accessTokenExpiry,
    },
  })


  app.register(routes, { prefix: '/api/v1' });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return app
}
