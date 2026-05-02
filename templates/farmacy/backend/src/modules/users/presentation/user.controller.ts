const { CreateUserDtoSchema, UpdateUserDtoSchema } = require('./user.dto');
const { userService } = require('../application/user.service');

const userController = {
    findAll: async (request, reply) => {
        const { page = 1, limit = 10 } = request.query;
        const result = await userService.findAll(Number(page), Number(limit));
        return reply.send(result);
    },

    findById: async (request, reply) => {
        const { id } = request.params;
        const user = await userService.findById(id);
        return reply.send(user);
    },

    create: async (request, reply) => {
        const data = CreateUserDtoSchema.parse(request.body);
        const user = await userService.create(data);
        return reply.status(201).send(user);
    },

    update: async (request, reply) => {
        const { id } = request.params;
        const data = UpdateUserDtoSchema.parse(request.body);
        const currentUserId = request.user.sub;
        const user = await userService.update(id, data, currentUserId);
        return reply.send(user);
    },

    delete: async (request, reply) => {
        const { id } = request.params;
        const currentUserId = request.user.sub;
        await userService.delete(id, currentUserId);
        return reply.send({ message: 'User deleted successfully' });
    },
};

module.exports = { userController };
