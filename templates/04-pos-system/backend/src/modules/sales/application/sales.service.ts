import { NotFoundError } from "@/core/errors/AppError"
import type { ISaleRepository } from "../domain/sales.interface"
import type { ISaleResponse, ISaleListResponse, ISaleReport } from "../domain/sales.types"
import type { CreateSaleData } from "../domain/sales.entities"

function mapSaleToResponse(sale: any): ISaleResponse {
  return {
    id: sale.id,
    subtotal: Number(sale.subtotal),
    tax_total: Number(sale.tax_total),
    discount: Number(sale.discount),
    total: Number(sale.total),
    payment_method: sale.payment_method,
    amount_received: sale.amount_received ? Number(sale.amount_received) : undefined,
    change_given: sale.change_given ? Number(sale.change_given) : undefined,
    user_id: sale.user_id,
    created_at: sale.created_at instanceof Date ? sale.created_at.toISOString() : sale.created_at,
    items: sale.items?.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      tax_rate: Number(item.tax_rate),
      line_total: Number(item.line_total),
    })),
  }
}

export const createSaleService = (repository: ISaleRepository) => ({
  create: async (data: CreateSaleData): Promise<ISaleResponse> => {
    const sale = await repository.create({
      ...data,
      tax_total: 0,
      items: data.items.map(item => ({ ...item, tax_rate: 0 })),
    })
    return mapSaleToResponse(sale)
  },

  getById: async (id: string): Promise<ISaleResponse> => {
    const sale = await repository.findById(id)
    if (!sale) {
      throw new NotFoundError("Sale not found")
    }
    return mapSaleToResponse(sale)
  },

  list: async (params?: { start_date?: string; end_date?: string; user_id?: string; payment_method?: string; page?: number; limit?: number }): Promise<ISaleListResponse> => {
    const result = await repository.findAll({
      startDate: params?.start_date ? new Date(params.start_date) : undefined,
      endDate: params?.end_date ? new Date(params.end_date) : undefined,
      userId: params?.user_id,
      paymentMethod: params?.payment_method,
      page: params?.page,
      limit: params?.limit,
    })

    return {
      sales: result.sales.map(mapSaleToResponse),
      total: result.total,
      page: params?.page || 1,
      limit: params?.limit || 50,
    }
  },

  getReport: async (params?: { start_date?: string; end_date?: string }): Promise<ISaleReport> => {
    const report = await repository.getReport({
      startDate: params?.start_date ? new Date(params.start_date) : undefined,
      endDate: params?.end_date ? new Date(params.end_date) : undefined,
    })

    return {
      total_sales: report.totalSales,
      total_revenue: report.totalRevenue,
      total_tax: report.totalTax,
      total_discount: report.totalDiscount,
      average_ticket: report.averageTicket,
      sales_by_payment_method: report.salesByPaymentMethod,
      top_products: report.topProducts.map(p => ({
        product_name: p.productName,
        quantity: p.quantity,
        revenue: p.revenue,
      })),
    }
  },
})
