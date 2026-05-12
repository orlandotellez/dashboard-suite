import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../../core/errors/AppError.js';
import { Role } from '../../types/index.js';

const requireRoles = (roles: Role[]) => {
    return async (_request: FastifyRequest, _reply: FastifyReply) => {
        const request = _request as FastifyRequest & { user?: { role?: Role } };
        const user = request.user;
        if (!user || !user.role) {
            throw new UnauthorizedError('User not authenticated');
        }

        if (!roles.includes(user.role)) {
            throw new ForbiddenError('Insufficient permissions');
        }
    };
};

export { requireRoles };