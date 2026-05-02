const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { env } = require('@/config/env');
const { prisma } = require('@/config/prisma');
const { redis, isRedisConnected } = require('@/config/redis');
const { UnauthorizedError } = require('@/core/errors/AppError');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateTokens = (userId, email, role) => {
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

const register = async (data) => {
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

const login = async (email, password) => {
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

const refresh = async (refreshToken) => {
    if (!isRedisConnected()) {
        throw new UnauthorizedError('Token refresh unavailable');
    }

    try {
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

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

const logout = async (userId) => {
    if (isRedisConnected()) {
        await redis.del(`refresh_token:${userId}`);
    }
};

module.exports = { register, login, refresh, logout, generateTokens };
