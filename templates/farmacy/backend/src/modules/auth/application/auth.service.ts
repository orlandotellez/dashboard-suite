import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import { prisma } from '../../../config/prisma.js';
import { redis, isRedisConnected } from '../../../config/redis.js';
import { UnauthorizedError, ConflictError } from '../../../core/errors/AppError.js';

const SALT_ROUNDS = 10;

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

const generateTokens = (userId: string, email: string, role: string) => {
    const accessToken = jwt.sign(
        { userId, email, role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: string;
}

interface AuthResult {
    user: any;
    accessToken: string;
    refreshToken: string;
}

const register = async (data: RegisterData): Promise<AuthResult> => {
    const { name, email, password, role = 'staff' } = data;

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
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    if (isRedisConnected()) {
        await redis.set(
            `refresh_token:${user.id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60
        );
    }

    return {
        user,
        accessToken,
        refreshToken,
    };
};

const login = async (email: string, password: string): Promise<AuthResult> => {
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

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    if (isRedisConnected()) {
        await redis.set(
            `refresh_token:${user.id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60
        );
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};

const refresh = async (refreshToken: string) => {
    if (!isRedisConnected()) {
        throw new UnauthorizedError('Token refresh unavailable');
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
            user.role
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
};

const logout = async (userId: string) => {
    if (isRedisConnected()) {
        await redis.del(`refresh_token:${userId}`);
    }
};

export { register, login, refresh, logout, generateTokens };