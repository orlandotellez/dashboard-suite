export { api, ApiError } from "./client";
export { authApi } from "./auth";
export { productsApi } from "./products";
export { categoriesApi } from "./categories";
export { salesApi } from "./sales";
export { inventoryApi } from "./inventory";
export { suppliersApi } from "./suppliers";
export { settingsApi } from "./settings";
export { usersApi } from "./users";

export type { AuthUser, Role, SessionInfo, UserSessionsResponse } from "./auth";
export type { Product, ProductCategory, ProductSupplier, ProductListResponse } from "./products";
export type { Category } from "./categories";
export type { Sale, SaleItem, SaleListResponse, SaleReport } from "./sales";
export type { InventoryMovement, MovementListResponse, LowStockProduct, LowStockResponse, BatchResponse, BatchListResponse, BatchItemResponse, CreateBatchPayload, CreateBatchItemPayload } from "./inventory";
export type { Supplier, SupplierListResponse, CreateSupplierPayload, UpdateSupplierPayload } from "./suppliers";
export type { Settings } from "./settings";
export type { UserResponse, UserListResponse, CreateUserPayload, UpdateUserPayload } from "./users";
