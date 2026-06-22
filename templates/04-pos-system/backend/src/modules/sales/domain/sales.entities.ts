import type { Decimal } from "@prisma/client/runtime/library"

export interface ISaleEntity {
  id: string
  subtotal: Decimal
  tax_total: Decimal
  discount: Decimal
  total: Decimal
  payment_method: string
  amount_received?: Decimal
  change_given?: Decimal
  user_id: string
  created_at: Date
  updated_at: Date
  items?: ISaleItemEntity[]
}

export interface ISaleItemEntity {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: Decimal
  tax_rate: Decimal
  line_total: Decimal
  created_at: Date
  updated_at: Date
}

export type CreateSaleItemData = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  tax_rate: number
  line_total: number
}

export type CreateSaleData = {
  subtotal: number
  tax_total: number
  discount: number
  total: number
  payment_method: string
  amount_received?: number
  change_given?: number
  user_id: string
  items: CreateSaleItemData[]
}
