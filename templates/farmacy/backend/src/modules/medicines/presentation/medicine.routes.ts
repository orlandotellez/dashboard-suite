const { medicineController } = require('./medicine.controller');
const { requireRoles } = require('@/presentation/middlewares/rbac');

const medicineRoutes = async (fastify, options) => {
    fastify.get('/', {
        preHandler: [fastify.authenticate],
        handler: medicineController.findAll,
    });

    fastify.get('/:id', {
        preHandler: [fastify.authenticate],
        handler: medicineController.findById,
    });

    fastify.post('/', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: medicineController.create,
    });

    fastify.put('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: medicineController.update,
    });

    fastify.patch('/:id/stock', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: medicineController.updateStock,
    });

    fastify.delete('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin'])],
        handler: medicineController.delete,
    });
};

module.exports = medicineRoutes;
