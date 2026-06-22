import type { ISaleEntity, ISaleItemEntity } from "../../domain/sales.entities"
import type { sale, sale_item } from "@prisma/client"

export function mapPrismaSaleToEntity(sale: sale & { items?: sale_item[] }): ISaleEntity {
  return {
    id: sale.id,
    subtotal: sale.subtotal,
    tax_total: sale.tax_total,
    discount: sale.discount,
    total: sale.total,
    payment_method: sale.payment_method,
    amount_received: sale.amount_received || undefined,
    change_given: sale.change_given || undefined,
    user_id: sale.user_id,
    created_at: sale.created_at,
    updated_at: sale.updated_at,
    items: sale.items?.map(mapPrismaSaleItemToEntity),
  }
}

export function mapPrismaSaleItemToEntity(item: sale_item): ISaleItemEntity {
  return {
    id: item.id,
    sale_id: item.sale_id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    tax_rate: item.tax_rate,
    line_total: item.line_total,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}
