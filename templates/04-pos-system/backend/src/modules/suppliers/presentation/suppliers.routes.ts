import type { FastifyInstance } from "fastify"
import { suppliersController } from "./suppliers.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const suppliersRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", { preHandler: [authGuard] }, suppliersController.list)
  fastify.get("/:id", { preHandler: [authGuard] }, suppliersController.getById)
  fastify.post("/", { preHandler: [authGuard] }, suppliersController.create)
  fastify.put("/:id", { preHandler: [authGuard] }, suppliersController.update)
  fastify.delete("/:id", { preHandler: [authGuard] }, suppliersController.delete)
}
