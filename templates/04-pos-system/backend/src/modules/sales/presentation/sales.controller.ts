import type { FastifyReply, FastifyRequest } from "fastify"
import { createSaleService } from "../application/sales.service"
import { SaleRepository } from "../infrastructure/sales.prisma.repository"
import { CreateSaleDtoSchema, SaleQuerySchema, ReportQuerySchema } from "./sales.dto"
import { UnauthorizedError } from "@/core/errors/AppError"
import { getUserIdFromCookies } from "@/core/utils/auth.utils"

const saleService = createSaleService(SaleRepository)

export const salesController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromCookies(request)
    if (!userId) throw new UnauthorizedError("Authentication required")

    const data = CreateSaleDtoSchema.parse(request.body)
    const result = await saleService.create({ ...data, user_id: userId })
    return reply.status(201).send(result)
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const result = await saleService.getById(id)
    return reply.status(200).send(result)
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = SaleQuerySchema.parse(request.query)
    const result = await saleService.list(query)
    return reply.status(200).send(result)
  },

  report: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = ReportQuerySchema.parse(request.query)
    const result = await saleService.getReport(query)
    return reply.status(200).send(result)
  },
}
