import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateClientDtoSchema, UpdateClientDtoSchema } from './client.dto.js';
import { clientService } from '../application/client.service.js';

export const clientController = {
    findAll: async (request: FastifyRequest, reply: FastifyReply) => {
        const result = await clientService.findAll(request.query as any);
        return reply.send(result);
    },

    findById: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        const client = await clientService.findById(id);
        return reply.send(client);
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
        const data = CreateClientDtoSchema.parse(request.body);
        const client = await clientService.create(data);
        return reply.status(201).send(client);
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        const data = UpdateClientDtoSchema.parse(request.body);
        const client = await clientService.update(id, data);
        return reply.send(client);
    },

    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        await clientService.delete(id);
        return reply.send({ message: 'Client deleted successfully' });
    },
};