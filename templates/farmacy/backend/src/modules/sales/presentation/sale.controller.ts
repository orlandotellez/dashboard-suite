const { CreateSaleDtoSchema } = require('./sale.dto');
const { saleService } = require('../application/sale.service');

const saleController = {
    findAll: async (request, reply) => {
        const result = await saleService.findAll(request.query);
        return reply.send(result);
    },

    findById: async (request, reply) => {
        const { id } = request.params;
        const sale = await saleService.findById(id);
        return reply.send(sale);
    },

    register: async (request, reply) => {
        const data = CreateSaleDtoSchema.parse(request.body);
        const userId = request.user.sub;
        const sale = await saleService.register(data, userId);
        return reply.status(201).send(sale);
    },
};

module.exports = { saleController };
