import { api } from "../client";
import type { Product } from "../products";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  note?: string;
  user_id: string;
  created_at: string;
}

export interface MovementListResponse {
  movements: InventoryMovement[];
  total: number;
  page: number;
  limit: number;
}

export interface LowStockProduct {
  product_id: string;
  product_name: string;
  current_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
}

export interface LowStockResponse {
  products: LowStockProduct[];
}

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface CreateMovementPayload {
  product_id: string;
  movement_type: "entrada" | "salida" | "ajuste";
  quantity: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const inventoryApi = {
  list: (params?: {
    product_id?: string;
    movement_type?: string;
    page?: number;
    limit?: number;
  }) => api.get<MovementListResponse>("/inventory", params as Record<string, string | number | boolean | undefined>),

  getByProduct: (productId: string) =>
    api.get<InventoryMovement[]>(`/inventory/product/${productId}`),

  create: (data: CreateMovementPayload) =>
    api.post<InventoryMovement>("/inventory", data),

  lowStock: () =>
    api.get<LowStockResponse>("/inventory/low-stock"),
};
