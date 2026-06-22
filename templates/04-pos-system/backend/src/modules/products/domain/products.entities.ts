import type { Decimal } from "@prisma/client/runtime/library"

export interface IProductEntity {
  id: string
  barcode?: string
  name: string
  category?: string
  price: Decimal
  cost: Decimal
  tax_rate: Decimal
  stock: number
  low_stock_threshold: number
  active: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export type CreateProductData = {
  barcode?: string
  name: string
  category?: string
  price: number
  cost?: number
  tax_rate?: number
  stock?: number
  low_stock_threshold?: number
  active?: boolean
}

export type UpdateProductData = Partial<CreateProductData>
