import type { FastifyInstance } from "fastify"
import { servicesController } from "./services.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const servicesRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", { preHandler: [authGuard] }, servicesController.list)
  fastify.get("/:id", { preHandler: [authGuard] }, servicesController.getById)
  fastify.post("/", { preHandler: [authGuard] }, servicesController.create)
  fastify.put("/:id", { preHandler: [authGuard] }, servicesController.update)
  fastify.delete("/:id", { preHandler: [authGuard] }, servicesController.delete)
}
