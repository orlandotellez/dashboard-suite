import jwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { env } from '../../config/env.js';

export async function registerAuth(app: FastifyInstance): Promise<void> {
    // Register JWT plugin
    await app.register(jwt, {
        secret: env.JWT_SECRET,
    });

    // Decorate app with authenticate method
    app.decorate('authenticate', async function(request: any, reply: any) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
}