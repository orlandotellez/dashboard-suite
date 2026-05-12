import jwt from '@fastify/jwt';
import { env } from '../../config/env.js';

const registerAuth = async (fastify: any, options: any) => {
    // Register JWT plugin
    await fastify.register(jwt, {
        secret: env.JWT_SECRET,
    });

    // Decorate fastify with authenticate method
    fastify.decorate('authenticate', async function(request: any, reply: any) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
};

export { registerAuth };