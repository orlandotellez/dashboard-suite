import { clientController } from './client.controller.js';
import { requireRoles } from '../../../presentation/middlewares/rbac.js';

const clientRoutes = async (fastify: any, _options: any) => {
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

export default clientRoutes;