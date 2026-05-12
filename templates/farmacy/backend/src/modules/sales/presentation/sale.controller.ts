import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateSaleDtoSchema } from './sale.dto.js';
import { saleService } from '../application/sale.service.js';
import { PaymentMethod } from '../../../types/index.js';

const saleController = {
    findAll: async (request: FastifyRequest, reply: FastifyReply) => {
        const result = await saleService.findAll(request.query as any);
        return reply.send(result);
    },

    findById: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        const sale = await saleService.findById(id);
        return reply.send(sale);
    },

    register: async (request: FastifyRequest, reply: FastifyReply) => {
        const data = CreateSaleDtoSchema.parse(request.body);
        const userId = (request as any).user?.sub;
        const sale = await saleService.register({
            ...data,
            paymentMethod: data.paymentMethod as PaymentMethod,
        }, userId);
        return reply.status(201).send(sale);
    },
};

export { saleController };