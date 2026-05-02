const { prisma } = require('@/config/prisma');

const userRepository = {
    findByEmail: async (email) => {
        return await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
    },

    findById: async (id) => {
        return await prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
    },

    findAllActive: async (skip = 0, take = 10) => {
        return await prisma.user.findMany({
            where: { deletedAt: null },
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    },

    countActive: async () => {
        return await prisma.user.count({
            where: { deletedAt: null },
        });
    },

    create: async (data) => {
        return await prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    },

    update: async (id, data) => {
        return await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    },

    softDelete: async (id) => {
        return await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },
};

module.exports = { userRepository };
