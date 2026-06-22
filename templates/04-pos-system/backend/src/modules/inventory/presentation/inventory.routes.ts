import type { FastifyInstance } from "fastify"
import { inventoryController } from "./inventory.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const inventoryRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/low-stock", { preHandler: [authGuard] }, inventoryController.lowStock)
  fastify.get("/product/:productId", { preHandler: [authGuard] }, inventoryController.getByProduct)
  fastify.get("/", { preHandler: [authGuard] }, inventoryController.list)
  fastify.post("/", { preHandler: [authGuard] }, inventoryController.createMovement)
}
