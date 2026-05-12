import { prisma } from '../../../config/prisma.js';

export const medicineRepository = {
    findById: async (id: string) => {
        return await prisma.medicine.findFirst({
            where: { id, deletedAt: null },
            include: {
                laboratory: true,
                category: true,
            },
        });
    },

    findAllActive: async (filters: any = {}, skip = 0, take = 10) => {
        const where: any = { deletedAt: null };

        if (filters.search) {
            where.OR = [
                { tradeName: { contains: filters.search, mode: 'insensitive' } },
                { genericName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.laboratoryId) {
            where.laboratoryId = filters.laboratoryId;
        }

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters.stockStatus) {
            if (filters.stockStatus === 'low') {
                where.stock = { lt: 10 };
            } else if (filters.stockStatus === 'out') {
                where.stock = 0;
            } else if (filters.stockStatus === 'adequate') {
                where.stock = { gte: 10, lt: 50 };
            } else if (filters.stockStatus === 'well') {
                where.stock = { gte: 50 };
            }
        }

        return await prisma.medicine.findMany({
            where,
            skip,
            take,
            include: {
                laboratory: true,
                category: true,
            },
            orderBy: { tradeName: 'asc' },
        });
    },

    countActive: async (filters: any = {}) => {
        const where: any = { deletedAt: null };

        if (filters.search) {
            where.OR = [
                { tradeName: { contains: filters.search, mode: 'insensitive' } },
                { genericName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.laboratoryId) {
            where.laboratoryId = filters.laboratoryId;
        }

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters.stockStatus) {
            if (filters.stockStatus === 'low') {
                where.stock = { lt: 10 };
            } else if (filters.stockStatus === 'out') {
                where.stock = 0;
            } else if (filters.stockStatus === 'adequate') {
                where.stock = { gte: 10, lt: 50 };
            } else if (filters.stockStatus === 'well') {
                where.stock = { gte: 50 };
            }
        }

        return await prisma.medicine.count({ where });
    },

    create: async (data: any) => {
        return await prisma.medicine.create({
            data,
            include: {
                laboratory: true,
                category: true,
            },
        });
    },

    update: async (id: string, data: any) => {
        return await prisma.medicine.update({
            where: { id },
            data,
            include: {
                laboratory: true,
                category: true,
            },
        });
    },

    updateStock: async (id: string, stock: number) => {
        return await prisma.medicine.update({
            where: { id },
            data: { stock },
        });
    },

    incrementStock: async (id: string, amount: number) => {
        return await prisma.medicine.update({
            where: { id },
            data: { stock: { increment: amount } },
        });
    },

    decrementStock: async (id: string, amount: number) => {
        return await prisma.medicine.update({
            where: { id },
            data: { stock: { decrement: amount } },
        });
    },

    softDelete: async (id: string) => {
        return await prisma.medicine.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },
};