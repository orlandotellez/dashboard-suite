import { authRoutes } from "@/modules/auth/presentation/auth.routes";
import { productsRoutes } from "@/modules/products/presentation/products.routes";
import { salesRoutes } from "@/modules/sales/presentation/sales.routes";
import { inventoryRoutes } from "@/modules/inventory/presentation/inventory.routes";
import { settingsRoutes } from "@/modules/settings/presentation/settings.routes";
import { type FastifyInstance } from "fastify";

export const routes = async (fastify: FastifyInstance, _option: any) => {
  fastify.register(authRoutes, { prefix: "/auth" })
  fastify.register(productsRoutes, { prefix: "/products" })
  fastify.register(salesRoutes, { prefix: "/sales" })
  fastify.register(inventoryRoutes, { prefix: "/inventory" })
  fastify.register(settingsRoutes, { prefix: "/settings" })
}
