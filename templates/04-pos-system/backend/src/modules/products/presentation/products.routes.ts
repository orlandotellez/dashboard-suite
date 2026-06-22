import type { FastifyInstance } from "fastify"
import { productsController } from "./products.controller"
import { authGuard } from "@/core/guard/auth.guard"

export const productsRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/", { preHandler: [authGuard] }, productsController.list)
  fastify.get("/barcode/:barcode", { preHandler: [authGuard] }, productsController.getByBarcode)
  fastify.get("/:id", { preHandler: [authGuard] }, productsController.getById)
  fastify.post("/", { preHandler: [authGuard] }, productsController.create)
  fastify.put("/:id", { preHandler: [authGuard] }, productsController.update)
  fastify.delete("/:id", { preHandler: [authGuard] }, productsController.delete)
}
