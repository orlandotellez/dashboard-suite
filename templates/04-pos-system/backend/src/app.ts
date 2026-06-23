import Fastify from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import compress from "@fastify/compress"
import cookie from "@fastify/cookie"
import rateLimit from "@fastify/rate-limit"
import { ZodError } from "zod"
import { AppError } from "./core/errors/AppError"
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
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:1420"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })

  await app.register(compress)

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  })

  await app.register(cookie)

  // ─── Global error handler ───
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      const first = error.errors[0]
      return reply.status(400).send({
        message: first?.message ?? "Datos inválidos"
      })
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message
      })
    }

    // Unknown errors — log and return generic message
    app.log.error(error)
    return reply.status(500).send({
      message: "Error interno del servidor"
    })
  })

  app.register(routes, { prefix: '/api/v1' });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() }
  })

  return app
}
