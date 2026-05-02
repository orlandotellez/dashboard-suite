const Fastify = require('fastify');
const { register, login, refresh, logout } = require('./auth.controller');

const authRoutes = async (fastify, options) => {
    fastify.post('/register', register);

    fastify.post('/login', login);

    fastify.post('/refresh', refresh);

    fastify.post('/logout', {
        preHandler: [fastify.authenticate],
        handler: logout,
    });
};

module.exports = authRoutes;
