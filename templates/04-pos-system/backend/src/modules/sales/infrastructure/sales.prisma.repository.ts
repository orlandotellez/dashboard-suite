import { prisma } from "@/config/prisma"
import type { ISaleRepository } from "../domain/sales.interface"
import type { ISaleEntity, CreateSaleData } from "../domain/sales.entities"
import { mapPrismaSaleToEntity } from "./mappers/sales.prisma.mappers"

export const SaleRepository: ISaleRepository = {
  async create(data: CreateSaleData) {
    const sale = await prisma.sale.create({
      data: {
        subtotal: data.subtotal,
        tax_total: data.tax_total,
        discount: data.discount,
        total: data.total,
        payment_method: data.payment_method,
        amount_received: data.amount_received,
        change_given: data.change_given,
        user_id: data.user_id,
        items: {
          create: data.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
            line_total: item.line_total,
          })),
        },
      },
      include: { items: true },
    })
    return mapPrismaSaleToEntity(sale)
  },

  async findById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!sale) return null
    return mapPrismaSaleToEntity(sale)
  },

  async findAll(params) {
    const where: any = {}

    if (params?.startDate || params?.endDate) {
      where.created_at = {}
      if (params.startDate) where.created_at.gte = params.startDate
      if (params.endDate) where.created_at.lte = params.endDate
    }
    if (params?.userId) where.user_id = params.userId
    if (params?.paymentMethod) where.payment_method = params.paymentMethod

    const page = params?.page || 1
    const limit = params?.limit || 50
    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { items: true },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.sale.count({ where }),
    ])

    return {
      sales: sales.map(mapPrismaSaleToEntity),
      total,
    }
  },

  async getReport(params) {
    const where: any = {}

    if (params?.startDate || params?.endDate) {
      where.created_at = {}
      if (params.startDate) where.created_at.gte = params.startDate
      if (params.endDate) where.created_at.lte = params.endDate
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { items: true },
    })

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
    const totalTax = sales.reduce((sum, s) => sum + Number(s.tax_total), 0)
    const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount), 0)
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    const salesByPaymentMethod: Record<string, number> = {}
    for (const sale of sales) {
      salesByPaymentMethod[sale.payment_method] = (salesByPaymentMethod[sale.payment_method] || 0) + Number(sale.total)
    }

    const productMap = new Map<string, { productName: string; quantity: number; revenue: number }>()
    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = productMap.get(item.product_id) || { productName: item.product_name, quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += Number(item.line_total)
        productMap.set(item.product_id, existing)
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      totalSales,
      totalRevenue,
      totalTax,
      totalDiscount,
      averageTicket,
      salesByPaymentMethod,
      topProducts,
    }
  },
}
