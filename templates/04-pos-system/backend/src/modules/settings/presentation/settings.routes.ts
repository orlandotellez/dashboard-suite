import type { FastifyInstance } from "fastify"
import { settingsController } from "./settings.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const settingsRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", { preHandler: [authGuard] }, settingsController.get)
  fastify.put("/", { preHandler: [authGuard] }, settingsController.update)
}
