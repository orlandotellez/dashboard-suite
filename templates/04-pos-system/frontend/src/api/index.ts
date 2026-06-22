export { api, ApiError } from "./client";
export { authApi } from "./auth";
export { productsApi } from "./products";
export { categoriesApi } from "./categories";
export { salesApi } from "./sales";
export { inventoryApi } from "./inventory";
export { settingsApi } from "./settings";

export type { AuthUser, Role, SessionInfo, UserSessionsResponse } from "./auth";
export type { Product, ProductCategory, ProductListResponse } from "./products";
export type { Category } from "./categories";
export type { Sale, SaleItem, SaleListResponse, SaleReport } from "./sales";
export type { InventoryMovement, MovementListResponse, LowStockProduct, LowStockResponse } from "./inventory";
export type { Settings } from "./settings";
