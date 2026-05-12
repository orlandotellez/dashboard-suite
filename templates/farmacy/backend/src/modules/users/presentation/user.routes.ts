import { userController } from './user.controller.js';
import { requireRoles } from '../../../presentation/middlewares/rbac.js';

const userRoutes = async (fastify: any, _options: any) => {
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

export default userRoutes;