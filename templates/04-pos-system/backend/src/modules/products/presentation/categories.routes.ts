import type { FastifyInstance } from "fastify"
import { categoriesController } from "./categories.controller"

export const categoriesRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", categoriesController.list)
}
