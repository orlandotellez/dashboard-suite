const { UnauthorizedError, ForbiddenError } = require('../../core/errors/AppError');

const requireRoles = (roles) => {
    return async (request, reply) => {
        const user = request.user;
        if (!user || !user.role) {
            throw new UnauthorizedError('User not authenticated');
        }

        if (!roles.includes(user.role)) {
            throw new ForbiddenError('Insufficient permissions');
        }
    };
};

module.exports = { requireRoles };
