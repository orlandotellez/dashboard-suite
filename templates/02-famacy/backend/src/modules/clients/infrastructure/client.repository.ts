import { prisma } from '../../../config/prisma.js';
import { Client, ClientFilters } from '../../../types/index.js';

interface CreateClientData {
    name: string;
    documentNumber: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    membership?: string;
}

interface UpdateClientData {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    membership?: string;
}

interface PurchaseHistory {
    totalPurchases: number;
    totalSpent: number;
    lastPurchase: Date | null;
    sales: Array<{
        id: string;
        date: Date;
        total: number;
        itemsCount: number;
    }>;
}

export const clientRepository = {
    findById: async (id: string): Promise<Client | null> => {
        return await prisma.client.findFirst({
            where: { id, deletedAt: null },
        });
    },

    findByDocumentNumber: async (documentNumber: string): Promise<Client | null> => {
        return await prisma.client.findFirst({
            where: { documentNumber },
        });
    },

    findByEmail: async (email: string): Promise<Client | null> => {
        if (!email) return null;
        return await prisma.client.findFirst({
            where: { email, deletedAt: null },
        });
    },

    findAllActive: async (filters: ClientFilters = {}, skip = 0, take = 10): Promise<Client[]> => {
        const where: any = { deletedAt: null };

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

    countActive: async (filters: ClientFilters = {}): Promise<number> => {
        const where: any = { deletedAt: null };

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

    create: async (data: CreateClientData): Promise<Client> => {
        return await prisma.client.create({
            data,
        });
    },

    update: async (id: string, data: UpdateClientData): Promise<Client> => {
        return await prisma.client.update({
            where: { id },
            data,
        });
    },

    softDelete: async (id: string): Promise<Client> => {
        return await prisma.client.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    getPurchaseHistory: async (id: string): Promise<PurchaseHistory> => {
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
                total: Number(sale.total),
                itemsCount: sale.items.length,
            })),
        };
    },
};