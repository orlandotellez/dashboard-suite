# Módulo Auth - Ejemplo Completo

Estructura completa siguiendo el patrón de Farmacy.

---

## src/modules/auth/application/auth.service.ts

```typescript
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import { prisma } from '../../../config/prisma.js';
import { redis, isRedisConnected } from '../../../config/redis.js';
import { UnauthorizedError, ConflictError, BadRequestError } from '../../../core/errors/AppError.js';
import { Role, AuthResponse } from '../../../types/index.js';

const SALT_ROUNDS = 10;

const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

interface TokenPayload {
    userId: string;
    email: string;
    role: Role;
}

const generateTokens = (userId: string, email: string, role: Role) => {
    const accessTokenOptions: SignOptions = {
        expiresIn: 900 // 15 minutes
    };

    const refreshTokenOptions: SignOptions = {
        expiresIn: 604800 // 7 days
    };

    const accessToken = jwt.sign(
        { userId, email, role } as TokenPayload,
        env.JWT_SECRET,
        accessTokenOptions
    );

    const refreshToken = jwt.sign(
        { userId },
        env.JWT_REFRESH_SECRET,
        refreshTokenOptions
    );

    return { accessToken, refreshToken };
};

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: Role;
}

export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const { name, email, password, role = 'VENDEDOR' } = data;

        const existingUser = await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });

        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as Role);

        if (isRedisConnected()) {
            await redis.set(
                `refresh_token:${user.id}`,
                refreshToken,
                'EX',
                7 * 24 * 60 * 60
            );
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as Role,
            },
            accessToken,
            refreshToken,
        };
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as Role);

        if (isRedisConnected()) {
            await redis.set(
                `refresh_token:${user.id}`,
                refreshToken,
                'EX',
                7 * 24 * 60 * 60
            );
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as Role,
            },
            accessToken,
            refreshToken,
        };
    },

    refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
        if (!isRedisConnected()) {
            throw new BadRequestError('Token refresh unavailable - Redis not connected');
        }

        try {
            const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

            const storedToken = await redis.get(`refresh_token:${payload.userId}`);

            if (storedToken !== refreshToken) {
                throw new UnauthorizedError('Invalid or expired refresh token');
            }

            const user = await prisma.user.findFirst({
                where: { id: payload.userId, deletedAt: null },
            });

            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(
                user.id,
                user.email,
                user.role as Role
            );

            await redis.set(
                `refresh_token:${user.id}`,
                newRefreshToken,
                'EX',
                7 * 24 * 60 * 60
            );

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    },

    logout: async (userId: string): Promise<void> => {
        if (isRedisConnected()) {
            await redis.del(`refresh_token:${userId}`);
        }
    },

    me: async (userId: string) => {
        const user = await prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                avatarColor: true,
                team: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        return user;
    },
};
```

---

## src/modules/auth/presentation/auth.controller.ts

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../application/auth.service.js';
import { LoginDtoSchema, RegisterDtoSchema } from './auth.dto.js';

export const authController = {
    register: async (request: FastifyRequest, reply: FastifyReply) => {
        const data = RegisterDtoSchema.parse(request.body);
        const result = await authService.register(data);
        return reply.status(201).send(result);
    },

    login: async (request: FastifyRequest, reply: FastifyReply) => {
        const data = LoginDtoSchema.parse(request.body);
        const result = await authService.login(data.email, data.password);
        return reply.send(result);
    },

    refresh: async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as { refreshToken: string };
        const result = await authService.refresh(body.refreshToken);
        return reply.send(result);
    },

    logout: async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = (request as any).user?.sub;
        await authService.logout(userId);
        return reply.send({ message: 'Logged out successfully' });
    },

    me: async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = (request as any).user?.sub;
        const user = await authService.me(userId);
        return reply.send(user);
    },
};
```

---

## src/modules/auth/presentation/auth.routes.ts

```typescript
import { authController } from './auth.controller.js';

const authRoutes = async (fastify: any, _options: any) => {
    // Public routes
    fastify.post('/register', {
        handler: authController.register,
    });

    fastify.post('/login', {
        handler: authController.login,
    });

    fastify.post('/refresh', {
        handler: authController.refresh,
    });

    // Protected routes
    fastify.post('/logout', {
        preHandler: [fastify.authenticate],
        handler: authController.logout,
    });

    fastify.get('/me', {
        preHandler: [fastify.authenticate],
        handler: authController.me,
    });
};

export default authRoutes;
```

---

## src/modules/auth/presentation/auth.dto.ts

```typescript
import { z } from 'zod';

export const RegisterDtoSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'MANAGER', 'VENDEDOR', 'SOLO_LECTURA']).optional(),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const RefreshDtoSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshDto = z.infer<typeof RefreshDtoSchema>;
```