import { register, login, refresh, logout } from './auth.controller.js';

const authRoutes = async (fastify: any, options: any) => {
    fastify.post('/register', register);

    fastify.post('/login', login);

    fastify.post('/refresh', refresh);

    fastify.post('/logout', {
        preHandler: [fastify.authenticate],
        handler: logout,
    });
};

export default authRoutes;