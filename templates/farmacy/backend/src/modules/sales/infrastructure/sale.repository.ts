const { prisma } = require('@/config/prisma');

const saleRepository = {
    findById: async (id) => {
        return await prisma.sale.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
                client: true,
                items: {
                    include: {
                        medicine: {
                            select: { id: true, tradeName: true, genericName: true },
                        },
                    },
                },
            },
        });
    },

    findAll: async (filters = {}, skip = 0, take = 10) => {
        const where = {};

        if (filters.startDate) {
            where.date = { gte: new Date(filters.startDate) };
        }
        if (filters.endDate) {
            where.date = { ...where.date, lte: new Date(filters.endDate) };
        }
        if (filters.clientId) {
            where.clientId = filters.clientId;
        }
        if (filters.paymentMethod) {
            where.paymentMethod = filters.paymentMethod;
        }
        if (filters.userId) {
            where.userId = filters.userId;
        }

        return await prisma.sale.findMany({
            where,
            skip,
            take,
            include: {
                user: {
                    select: { id: true, name: true },
                },
                client: {
                    select: { id: true, name: true },
                },
                items: {
                    include: {
                        medicine: {
                            select: { id: true, tradeName: true },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    },

    count: async (filters = {}) => {
        const where = {};

        if (filters.startDate) {
            where.date = { gte: new Date(filters.startDate) };
        }
        if (filters.endDate) {
            where.date = { ...where.date, lte: new Date(filters.endDate) };
        }
        if (filters.clientId) {
            where.clientId = filters.clientId;
        }
        if (filters.paymentMethod) {
            where.paymentMethod = filters.paymentMethod;
        }
        if (filters.userId) {
            where.userId = filters.userId;
        }

        return await prisma.sale.count({ where });
    },

    create: async (data) => {
        return await prisma.sale.create({
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                client: true,
                items: {
                    include: {
                        medicine: true,
                    },
                },
            },
        });
    },

    createItems: async (items) => {
        return await prisma.saleItem.createMany({
            data: items,
        });
    },

    updateMedicinesStock: async (updates) => {
        const promises = updates.map(({ id, decrement }) =>
            prisma.medicine.update({
                where: { id },
                data: { stock: { decrement } },
            })
        );
        return await Promise.all(promises);
    },
};

module.exports = { saleRepository };
