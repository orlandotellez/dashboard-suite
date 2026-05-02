const { prisma } = require('@/config/prisma');

const clientRepository = {
    findById: async (id) => {
        return await prisma.client.findFirst({
            where: { id, deletedAt: null },
        });
    },

    findByDocumentNumber: async (documentNumber) => {
        return await prisma.client.findFirst({
            where: { documentNumber },
        });
    },

    findByEmail: async (email) => {
        if (!email) return null;
        return await prisma.client.findFirst({
            where: { email, deletedAt: null },
        });
    },

    findAllActive: async (filters = {}, skip = 0, take = 10) => {
        const where = { deletedAt: null };

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { documentNumber: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.membership) {
            where.membership = filters.membership;
        }

        return await prisma.client.findMany({
            where,
            skip,
            take,
            orderBy: { name: 'asc' },
        });
    },

    countActive: async (filters = {}) => {
        const where = { deletedAt: null };

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { documentNumber: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.membership) {
            where.membership = filters.membership;
        }

        return await prisma.client.count({ where });
    },

    create: async (data) => {
        return await prisma.client.create({
            data,
        });
    },

    update: async (id, data) => {
        return await prisma.client.update({
            where: { id },
            data,
        });
    },

    softDelete: async (id) => {
        return await prisma.client.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    getPurchaseHistory: async (id) => {
        const sales = await prisma.sale.findMany({
            where: { clientId: id },
            include: {
                items: {
                    include: {
                        medicine: {
                            select: { tradeName: true },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });

        const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const lastPurchase = sales.length > 0 ? sales[0].date : null;

        return {
            totalPurchases: sales.length,
            totalSpent,
            lastPurchase,
            sales: sales.map(sale => ({
                id: sale.id,
                date: sale.date,
                total: sale.total,
                itemsCount: sale.items.length,
            })),
        };
    },
};

module.exports = { clientRepository };
