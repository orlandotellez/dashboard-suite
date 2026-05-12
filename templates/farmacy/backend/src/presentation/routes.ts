import authRoutes from '../modules/auth/presentation/auth.routes.js';
import userRoutes from '../modules/users/presentation/user.routes.js';
import medicineRoutes from '../modules/medicines/presentation/medicine.routes.js';
import saleRoutes from '../modules/sales/presentation/sale.routes.js';
import clientRoutes from '../modules/clients/presentation/client.routes.js';
import reportRoutes from '../modules/reports/presentation/report.routes.js';

const routes = async (fastify: any, options: any) => {
    fastify.register(authRoutes, { prefix: '/auth' });
    fastify.register(userRoutes, { prefix: '/users' });
    fastify.register(medicineRoutes, { prefix: '/medicines' });
    fastify.register(saleRoutes, { prefix: '/sales' });
    fastify.register(clientRoutes, { prefix: '/clients' });
    fastify.register(reportRoutes, { prefix: '/reports' });
};

export { routes };