import { prisma } from "@/config/prisma"
import type { IProductRepository } from "../domain/products.interface"
import type { IProductEntity, CreateProductData, UpdateProductData } from "../domain/products.entities"
import { Prisma } from "@prisma/client"

const productSelect = {
  id: true,
  barcode: true,
  name: true,
  category: true,
  price: true,
  cost: true,
  tax_rate: true,
  stock: true,
  low_stock_threshold: true,
  active: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}

function mapToEntity(product: any): IProductEntity {
  return {
    id: product.id,
    barcode: product.barcode || undefined,
    name: product.name,
    category: product.category || undefined,
    price: product.price,
    cost: product.cost,
    tax_rate: product.tax_rate,
    stock: product.stock,
    low_stock_threshold: product.low_stock_threshold,
    active: product.active,
    created_at: product.created_at,
    updated_at: product.updated_at,
    deleted_at: product.deleted_at || undefined,
  }
}

export const ProductRepository: IProductRepository = {
  async findAll(params) {
    const where: Prisma.productWhereInput = {
      deleted_at: null,
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { barcode: { contains: params.search, mode: "insensitive" } },
        { category: { contains: params.search, mode: "insensitive" } },
      ]
    }

    if (params?.category) {
      where.category = params.category
    }

    if (params?.active !== undefined) {
      where.active = params.active
    }

    if (params?.lowStock) {
      where.stock = { lte: prisma.product.fields.low_stock_threshold }
    }

    const page = params?.page || 1
    const limit = params?.limit || 50
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: productSelect,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products: products.map(mapToEntity),
      total,
    }
  },

  async findById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deleted_at: null },
      select: productSelect,
    })
    if (!product) return null
    return mapToEntity(product)
  },

  async findByBarcode(barcode: string) {
    const product = await prisma.product.findFirst({
      where: { barcode, deleted_at: null },
      select: productSelect,
    })
    if (!product) return null
    return mapToEntity(product)
  },

  async create(data: CreateProductData) {
    const product = await prisma.product.create({
      data: {
        barcode: data.barcode,
        name: data.name,
        category: data.category,
        price: data.price,
        cost: data.cost ?? 0,
        tax_rate: data.tax_rate ?? 0,
        stock: data.stock ?? 0,
        low_stock_threshold: data.low_stock_threshold ?? 5,
        active: data.active ?? true,
      },
      select: productSelect,
    })
    return mapToEntity(product)
  },

  async update(id: string, data: UpdateProductData) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.tax_rate !== undefined && { tax_rate: data.tax_rate }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.low_stock_threshold !== undefined && { low_stock_threshold: data.low_stock_threshold }),
        ...(data.active !== undefined && { active: data.active }),
      },
      select: productSelect,
    })
    return mapToEntity(product)
  },

  async softDelete(id: string) {
    await prisma.product.update({
      where: { id },
      data: { deleted_at: new Date() },
    })
  },

  async updateStock(id: string, quantity: number) {
    const product = await prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
      select: productSelect,
    })
    return mapToEntity(product)
  },
}
