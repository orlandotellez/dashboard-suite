# Errors - Clases de Errores Personalizados

## src/core/errors/AppError.ts

```typescript
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation error') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400, 'BAD_REQUEST');
    }
}
```

---

## src/presentation/middlewares/errorHandler.ts

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../../core/errors/AppError.js';

interface FastifyError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    error: FastifyError,
    _request: FastifyRequest,
    reply: FastifyReply
) => {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Validation Error',
            message: 'Invalid request data',
            validationErrors: (error as any).issues,
        });
    }

    // Handle operational errors (our custom errors)
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            statusCode: error.statusCode,
            error: error.code,
            message: error.message,
        });
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);

    return reply.status(500).send({
        statusCode: 500,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
    });
};
```