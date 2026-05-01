import Fastify from "fastify"
import type { FastifyRequest, FastifyReply } from "fastify"
import jwt from "@fastify/jwt"
import { env } from "@/config/env"

const PORT = env?.PORT || 3000

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const fastify = Fastify({
  logger: true
})

fastify.register(async (fastify) => {
  await fastify.register(jwt, {
    secret: env?.JWT_SECRET as string
  })
})

fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify()
  } catch (error) {
    reply.send(error)
  }
})

fastify.get("/", (_req, reply) => {
  reply.send({ hello: "world" })
})

fastify.listen({ port: PORT as number }, (err, _address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

