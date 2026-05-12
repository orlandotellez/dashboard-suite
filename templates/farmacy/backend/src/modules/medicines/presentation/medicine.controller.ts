import { CreateMedicineDtoSchema, UpdateMedicineDtoSchema, UpdateStockDtoSchema } from './medicine.dto.js';
import { medicineService } from '../application/medicine.service.js';

export const medicineController = {
    findAll: async (request: any, reply: any) => {
        const result = await medicineService.findAll(request.query);
        return reply.send(result);
    },

    findById: async (request: any, reply: any) => {
        const { id } = request.params;
        const medicine = await medicineService.findById(id);
        return reply.send(medicine);
    },

    create: async (request: any, reply: any) => {
        const data = CreateMedicineDtoSchema.parse(request.body);
        const medicine = await medicineService.create(data);
        return reply.status(201).send(medicine);
    },

    update: async (request: any, reply: any) => {
        const { id } = request.params;
        const data = UpdateMedicineDtoSchema.parse(request.body);
        const medicine = await medicineService.update(id, data);
        return reply.send(medicine);
    },

    updateStock: async (request: any, reply: any) => {
        const { id } = request.params;
        const data = UpdateStockDtoSchema.parse(request.body);
        const medicine = await medicineService.updateStock(id, data);
        return reply.send(medicine);
    },

    delete: async (request: any, reply: any) => {
        const { id } = request.params;
        await medicineService.delete(id);
        return reply.send({ message: 'Medicine deleted successfully' });
    },
};