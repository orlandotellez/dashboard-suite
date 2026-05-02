const { clientController } = require('./client.controller');
const { requireRoles } = require('@/presentation/middlewares/rbac');

const clientRoutes = async (fastify, options) => {
    fastify.get('/', {
        preHandler: [fastify.authenticate],
        handler: clientController.findAll,
    });

    fastify.get('/:id', {
        preHandler: [fastify.authenticate],
        handler: clientController.findById,
    });

    fastify.post('/', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: clientController.create,
    });

    fastify.put('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: clientController.update,
    });

    fastify.delete('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: clientController.delete,
    });
};

module.exports = clientRoutes;
