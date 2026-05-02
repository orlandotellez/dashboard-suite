const jwt = require('@fastify/jwt');
const { env } = require('../../config/env');

const registerAuth = async (fastify, options) => {
    // Register JWT plugin
    await fastify.register(jwt, {
        secret: env.JWT_SECRET,
    });

    // Decorate fastify with authenticate method
    fastify.decorate('authenticate', async function(request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
};

module.exports = { registerAuth };
