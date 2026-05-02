const authRoutes = require('@/modules/auth/presentation/auth.routes');
const userRoutes = require('@/modules/users/presentation/user.routes');
const medicineRoutes = require('@/modules/medicines/presentation/medicine.routes');
const saleRoutes = require('@/modules/sales/presentation/sale.routes');
const clientRoutes = require('@/modules/clients/presentation/client.routes');
const reportRoutes = require('@/modules/reports/presentation/report.routes');

const routes = async (fastify, options) => {
    fastify.register(authRoutes, { prefix: '/auth' });
    fastify.register(userRoutes, { prefix: '/users' });
    fastify.register(medicineRoutes, { prefix: '/medicines' });
    fastify.register(saleRoutes, { prefix: '/sales' });
    fastify.register(clientRoutes, { prefix: '/clients' });
    fastify.register(reportRoutes, { prefix: '/reports' });
};

module.exports = { routes };
