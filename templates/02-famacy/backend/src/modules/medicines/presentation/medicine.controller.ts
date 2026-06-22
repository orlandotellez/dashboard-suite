import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMedicineDtoSchema, UpdateMedicineDtoSchema, UpdateStockDtoSchema } from './medicine.dto.js';
import { medicineService } from '../application/medicine.service.js';
import { CreateMedicineDto, UpdateMedicineDto, UpdateStockDto, MedicineFilters } from '../../../types/index.js';

interface Params {
    id: string;
}

interface Query extends MedicineFilters {
    page?: number;
    limit?: number;
}

export const medicineController = {
    findAll: async (request: FastifyRequest<{ Querystring: Query }>, reply: FastifyReply) => {
        const result = await medicineService.findAll(request.query);
        return reply.send(result);
    },

    findById: async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
        const { id } = request.params;
        const medicine = await medicineService.findById(id);
        return reply.send(medicine);
    },

    create: async (request: FastifyRequest<{ Body: CreateMedicineDto }>, reply: FastifyReply) => {
        const data = CreateMedicineDtoSchema.parse(request.body);
        const medicine = await medicineService.create(data);
        return reply.status(201).send(medicine);
    },

    update: async (request: FastifyRequest<{ Params: Params; Body: UpdateMedicineDto }>, reply: FastifyReply) => {
        const { id } = request.params;
        const data = UpdateMedicineDtoSchema.parse(request.body);
        const medicine = await medicineService.update(id, data);
        return reply.send(medicine);
    },

    updateStock: async (request: FastifyRequest<{ Params: Params; Body: UpdateStockDto }>, reply: FastifyReply) => {
        const { id } = request.params;
        const data = UpdateStockDtoSchema.parse(request.body);
        const medicine = await medicineService.updateStock(id, data);
        return reply.send(medicine);
    },

    delete: async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
        const { id } = request.params;
        await medicineService.delete(id);
        return reply.send({ message: 'Medicine deleted successfully' });
    },
};