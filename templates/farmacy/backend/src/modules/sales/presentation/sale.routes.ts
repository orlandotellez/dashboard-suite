import { saleController } from './sale.controller.js';
import { requireRoles } from '@/presentation/middlewares/rbac';

const saleRoutes = async (fastify, options) => {
    fastify.get('/', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: saleController.findAll,
    });

    fastify.get('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: saleController.findById,
    });

    fastify.post('/', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: saleController.register,
    });
};

export default saleRoutes;