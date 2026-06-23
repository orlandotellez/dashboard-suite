import type { FastifyInstance } from "fastify"
import { batchInventoryController } from "./batch-inventory.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const batchInventoryRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", { preHandler: [authGuard] }, batchInventoryController.list)
  fastify.get("/:id", { preHandler: [authGuard] }, batchInventoryController.getById)
  fastify.post("/", { preHandler: [authGuard] }, batchInventoryController.create)
}
