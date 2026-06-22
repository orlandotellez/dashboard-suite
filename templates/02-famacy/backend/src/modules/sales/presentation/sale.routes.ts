import { saleController } from './sale.controller.js';
import { requireRoles } from '../../../presentation/middlewares/rbac.js';

const saleRoutes = async (fastify: any, _options: any) => {
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