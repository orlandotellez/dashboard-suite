import { UnauthorizedError, ForbiddenError } from '../../core/errors/AppError.js';

const requireRoles = (roles: string[]) => {
    return async (request: any, reply: any) => {
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