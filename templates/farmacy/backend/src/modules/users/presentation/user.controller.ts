import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserDtoSchema, UpdateUserDtoSchema } from './user.dto.js';
import { userService } from '../application/user.service.js';

export const userController = {
    findAll: async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as { page?: number; limit?: number };
        const { page = 1, limit = 10 } = query;
        const result = await userService.findAll(Number(page), Number(limit));
        return reply.send(result);
    },

    findById: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        const user = await userService.findById(id);
        return reply.send(user);
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
        const data = CreateUserDtoSchema.parse(request.body);
        const user = await userService.create(data);
        return reply.status(201).send(user);
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        const data = UpdateUserDtoSchema.parse(request.body);
        const body = request.body as { user?: { sub?: string } };
        const currentUserId = (request as any).user?.sub;
        const user = await userService.update(id, data, currentUserId);
        return reply.send(user);
    },

    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { id: string };
        const { id } = params;
        const currentUserId = (request as any).user?.sub;
        await userService.delete(id, currentUserId);
        return reply.send({ message: 'User deleted successfully' });
    },
};