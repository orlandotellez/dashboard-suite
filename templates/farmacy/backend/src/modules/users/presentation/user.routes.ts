const { userController } = require('./user.controller');
const { requireRoles } = require('@/presentation/middlewares/rbac');

const userRoutes = async (fastify, options) => {
    const userServiceInstance = require('../application/user.service').userService;
    const userRepositoryInstance = require('../infrastructure/user.repository').userRepository;

    fastify.get('/', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: userController.findAll,
    });

    fastify.get('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: userController.findById,
    });

    fastify.post('/', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: userController.create,
    });

    fastify.put('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: userController.update,
    });

    fastify.delete('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: userController.delete,
    });
};

module.exports = userRoutes;
