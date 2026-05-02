const { CreateMedicineDtoSchema, UpdateMedicineDtoSchema, UpdateStockDtoSchema } = require('./medicine.dto');
const { medicineService } = require('../application/medicine.service');

const medicineController = {
    findAll: async (request, reply) => {
        const result = await medicineService.findAll(request.query);
        return reply.send(result);
    },

    findById: async (request, reply) => {
        const { id } = request.params;
        const medicine = await medicineService.findById(id);
        return reply.send(medicine);
    },

    create: async (request, reply) => {
        const data = CreateMedicineDtoSchema.parse(request.body);
        const medicine = await medicineService.create(data);
        return reply.status(201).send(medicine);
    },

    update: async (request, reply) => {
        const { id } = request.params;
        const data = UpdateMedicineDtoSchema.parse(request.body);
        const medicine = await medicineService.update(id, data);
        return reply.send(medicine);
    },

    updateStock: async (request, reply) => {
        const { id } = request.params;
        const data = UpdateStockDtoSchema.parse(request.body);
        const medicine = await medicineService.updateStock(id, data);
        return reply.send(medicine);
    },

    delete: async (request, reply) => {
        const { id } = request.params;
        await medicineService.delete(id);
        return reply.send({ message: 'Medicine deleted successfully' });
    },
};

module.exports = { medicineController };
