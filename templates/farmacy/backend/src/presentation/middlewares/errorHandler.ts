import { ZodError } from 'zod';
import { logger } from '../../infrastructure/logger.js';
import { AppError } from '../../core/errors/AppError.js';

const errorHandler = (error: any, request: any, reply: any) => {
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

export { errorHandler };