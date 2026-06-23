import { authRoutes } from "@/modules/auth/presentation/auth.routes";
import { productsRoutes } from "@/modules/products/presentation/products.routes";
import { categoriesRoutes } from "@/modules/products/presentation/categories.routes";
import { salesRoutes } from "@/modules/sales/presentation/sales.routes";
import { inventoryRoutes } from "@/modules/inventory/presentation/inventory.routes";
import { batchInventoryRoutes } from "@/modules/batch-inventory/presentation/batch-inventory.routes";
import { suppliersRoutes } from "@/modules/suppliers/presentation/suppliers.routes";
import { settingsRoutes } from "@/modules/settings/presentation/settings.routes";
import { usersRoutes } from "@/modules/users/presentation/users.routes";
import { type FastifyInstance } from "fastify";

export const routes = async (fastify: FastifyInstance, _option: any) => {
  fastify.register(authRoutes, { prefix: "/auth" })
  fastify.register(productsRoutes, { prefix: "/products" })
  fastify.register(categoriesRoutes, { prefix: "/categories" })
  fastify.register(salesRoutes, { prefix: "/sales" })
  fastify.register(inventoryRoutes, { prefix: "/inventory" })
  fastify.register(batchInventoryRoutes, { prefix: "/inventory/batches" })
  fastify.register(suppliersRoutes, { prefix: "/suppliers" })
  fastify.register(settingsRoutes, { prefix: "/settings" })
  fastify.register(usersRoutes, { prefix: "/users" })
}
