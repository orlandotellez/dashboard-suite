import type { FastifyInstance } from "fastify"
import { usersController } from "./users.controller"
import { authGuard, adminGuard } from "@/core/guard/auth.guard"

export const usersRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", { preHandler: [authGuard, adminGuard] }, usersController.list)
  fastify.get("/:id", { preHandler: [authGuard, adminGuard] }, usersController.getById)
  fastify.post("/", { preHandler: [authGuard, adminGuard] }, usersController.create)
  fastify.put("/:id", { preHandler: [authGuard, adminGuard] }, usersController.update)
  fastify.delete("/:id", { preHandler: [authGuard, adminGuard] }, usersController.delete)
}
