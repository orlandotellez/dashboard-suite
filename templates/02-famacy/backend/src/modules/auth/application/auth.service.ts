import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import { prisma } from '../../../config/prisma.js';
import { redis, isRedisConnected } from '../../../config/redis.js';
import { UnauthorizedError, ConflictError } from '../../../core/errors/AppError.js';
import { Role, UserWithoutPassword, AuthResponse } from '../../../types/index.js';

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
        expiresIn: 900 // 15 minutes in seconds
    };
    
    const refreshTokenOptions: SignOptions = {
        expiresIn: 604800 // 7 days in seconds
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

const register = async (data: RegisterData): Promise<AuthResponse> => {
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
};

const login = async (email: string, password: string): Promise<AuthResponse> => {
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
};

interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

const refresh = async (refreshToken: string): Promise<RefreshResponse> => {
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
};

const logout = async (userId: string): Promise<void> => {
    if (isRedisConnected()) {
        await redis.del(`refresh_token:${userId}`);
    }
};

export { register, login, refresh, logout, generateTokens };