import { prisma } from "@/config/prisma"
import { NotFoundError, BadRequestError } from "@/core/errors/AppError"
import type { IBatchInventoryRepository } from "../domain/batch-inventory.interface"
import type { IProductRepository } from "../../products/domain/products.interface"
import type { IBatchResponse, IBatchListResponse } from "../domain/batch-inventory.types"
import type { CreateBatchData } from "../domain/batch-inventory.entities"

function mapBatchToResponse(batch: any): IBatchResponse {
  const items = (batch.items || []).map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product?.name,
    quantity: item.quantity,
    unit_cost: item.unit_cost ? Number(item.unit_cost) : null,
    notes: item.notes || null,
  }))

  const total_items = items.length
  const total_quantity = items.reduce((sum: number, i: any) => sum + i.quantity, 0)

  return {
    id: batch.id,
    movement_type: batch.movement_type,
    supplier_id: batch.supplier_id || null,
    supplier_name: batch.supplier?.name,
    notes: batch.notes || null,
    user_id: batch.user_id,
    user_name: batch.user?.name,
    items,
    total_items,
    total_quantity,
    created_at: batch.created_at instanceof Date ? batch.created_at.toISOString() : batch.created_at,
  }
}

export const createBatchInventoryService = (
  batchInventoryRepository: IBatchInventoryRepository,
  productRepository: IProductRepository
) => ({
  create: async (data: CreateBatchData): Promise<IBatchResponse> => {
    const products = await Promise.all(
      data.items.map(item => productRepository.findById(item.product_id))
    )

    for (let i = 0; i < data.items.length; i++) {
      const product = products[i]
      if (!product || product.deleted_at) {
        throw new NotFoundError(`Product ${data.items[i].product_id} not found`)
      }
    }

    if (data.movement_type === "salida") {
      for (let i = 0; i < data.items.length; i++) {
        const product = products[i]!
        if (product.stock < data.items[i].quantity) {
          throw new BadRequestError(`Insufficient stock for product ${product.name}`)
        }
      }
    }

    const batch = await prisma.$transaction(async (tx) => {
      const created = await tx.inventory_batch.create({
        data: {
          movement_type: data.movement_type,
          supplier_id: data.supplier_id,
          notes: data.notes,
          user_id: data.user_id,
          items: {
            create: data.items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
          supplier: { select: { name: true } },
          user: { select: { name: true } },
        },
      })

      for (const item of data.items) {
        const stockAdjustment = data.movement_type === "entrada"
          ? item.quantity
          : data.movement_type === "salida"
            ? -item.quantity
            : item.quantity

        await tx.product.update({
          where: { id: item.product_id },
          data: { stock: { increment: stockAdjustment } },
        })

        await tx.inventory_movement.create({
          data: {
            product_id: item.product_id,
            movement_type: data.movement_type,
            quantity: item.quantity,
            note: data.notes,
            batch_id: created.id,
            user_id: data.user_id,
          },
        })
      }

      return created
    })

    return mapBatchToResponse(batch)
  },

  getById: async (id: string): Promise<IBatchResponse> => {
    const batch = await batchInventoryRepository.findById(id)
    if (!batch) {
      throw new NotFoundError("Batch not found")
    }

    const full = await prisma.inventory_batch.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
        supplier: { select: { name: true } },
        user: { select: { name: true } },
      },
    })

    if (!full) throw new NotFoundError("Batch not found")
    return mapBatchToResponse(full)
  },

  list: async (params?: { movement_type?: string; supplier_id?: string; page?: number; limit?: number }): Promise<IBatchListResponse> => {
    const result = await batchInventoryRepository.findAll(params)

    const batches = await Promise.all(
      result.batches.map(async (b) => {
        const full = await prisma.inventory_batch.findUnique({
          where: { id: b.id },
          include: {
            items: {
              include: { product: { select: { name: true } } },
            },
            supplier: { select: { name: true } },
            user: { select: { name: true } },
          },
        })
        return full ? mapBatchToResponse(full) : mapBatchToResponse(b)
      })
    )

    return {
      batches,
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  },
})
