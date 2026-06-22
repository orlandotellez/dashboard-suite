import Fastify from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import compress from "@fastify/compress"
import cookie from "@fastify/cookie"
import rateLimit from "@fastify/rate-limit"
import { env } from "./config/env"
import { getRedisClient } from "./config/redis"
import { routes } from "./presentation/routes"

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
  })

  getRedisClient()

  await app.register(helmet)

  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })

  await app.register(compress)

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  })

  await app.register(cookie)

  app.register(routes, { prefix: '/api/v1' });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() }
  })

  return app
}
