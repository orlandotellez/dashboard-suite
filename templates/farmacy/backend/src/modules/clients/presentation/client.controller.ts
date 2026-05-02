const { CreateClientDtoSchema, UpdateClientDtoSchema } = require('./client.dto');
const { clientService } = require('../application/client.service');

const clientController = {
    findAll: async (request, reply) => {
        const result = await clientService.findAll(request.query);
        return reply.send(result);
    },

    findById: async (request, reply) => {
        const { id } = request.params;
        const client = await clientService.findById(id);
        return reply.send(client);
    },

    create: async (request, reply) => {
        const data = CreateClientDtoSchema.parse(request.body);
        const client = await clientService.create(data);
        return reply.status(201).send(client);
    },

    update: async (request, reply) => {
        const { id } = request.params;
        const data = UpdateClientDtoSchema.parse(request.body);
        const client = await clientService.update(id, data);
        return reply.send(client);
    },

    delete: async (request, reply) => {
        const { id } = request.params;
        await clientService.delete(id);
        return reply.send({ message: 'Client deleted successfully' });
    },
};

module.exports = { clientController };
