const { reportController } = require('./report.controller');
const { requireRoles } = require('@/presentation/middlewares/rbac');

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

module.exports = reportRoutes;
