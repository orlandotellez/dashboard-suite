const { ZodError } = require('zod');
const { logger } = require('../../infrastructure/logger');
const { AppError } = require('../../core/errors/AppError');

const errorHandler = (error, request, reply) => {
    if (error instanceof ZodError) {
        logger.warn({ err: error }, 'Validation error');
        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            issues: error.issues,
        });
    }

    if (error instanceof AppError) {
        logger.warn({ err: error }, error.message);
        return reply.status(error.statusCode).send({
            statusCode: error.statusCode,
            error: error.name,
            message: error.message,
        });
    }

    if (error.statusCode) {
        return reply.status(error.statusCode).send({
            statusCode: error.statusCode,
            error: error.name,
            message: error.message,
        });
    }

    logger.error({ err: error }, 'Unhandled Error');
    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
    });
};

module.exports = { errorHandler };
