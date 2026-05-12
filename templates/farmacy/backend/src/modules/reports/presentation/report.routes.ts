import { reportController } from './report.controller.js';
import { requireRoles } from '@/presentation/middlewares/rbac.js';

const reportRoutes = async (fastify, options) => {
    fastify.get('/sales', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: reportController.salesReport,
    });

    fastify.get('/top-medicines', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: reportController.topMedicines,
    });

    fastify.get('/dashboard', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: reportController.dashboard,
    });

    fastify.get('/stock-status', {
        preHandler: [fastify.authenticate, requireRoles(['admin', 'staff'])],
        handler: reportController.stockStatus,
    });
};

export default reportRoutes;