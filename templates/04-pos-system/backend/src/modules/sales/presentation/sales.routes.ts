import type { FastifyInstance } from "fastify"
import { salesController } from "./sales.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const salesRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/report", { preHandler: [authGuard] }, salesController.report)
  fastify.get("/revenue-trend", { preHandler: [authGuard] }, salesController.revenueTrend)
  fastify.get("/:id", { preHandler: [authGuard] }, salesController.getById)
  fastify.get("/", { preHandler: [authGuard] }, salesController.list)
  fastify.post("/", { preHandler: [authGuard] }, salesController.create)
}
