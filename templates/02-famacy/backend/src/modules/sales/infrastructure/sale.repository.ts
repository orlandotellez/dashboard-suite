import { prisma } from '../../../config/prisma.js';
import { Sale, SaleFilters, SaleItem } from '../../../types/index.js';

// Helper to convert Prisma Decimal to number
const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value.toNumber === 'function') return value.toNumber();
    return Number(value);
};

interface CreateSaleData {
    total: number;
    paymentMethod: string;
    userId: string;
    clientId?: string | null;
    items?: any[];
}

interface StockUpdate {
    id: string;
    decrement: number;
}

const mapPrismaToSale = (data: any): Sale => ({
    id: data.id,
    date: data.date,
    total: toNumber(data.total),
    paymentMethod: data.paymentMethod,
    userId: data.userId,
    clientId: data.clientId,
    items: data.items ? data.items.map((item: any) => ({
        id: item.id,
        saleId: item.saleId,
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
    })) : undefined,
});

export const saleRepository = {
    findById: async (id: string): Promise<Sale | null> => {
        const data = await prisma.sale.findUnique({
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
        return data ? mapPrismaToSale(data) : null;
    },

    findAll: async (filters: SaleFilters & { paymentMethod?: string } = {}, skip = 0, take = 10): Promise<Sale[]> => {
        const where: any = {};

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

        const results = await prisma.sale.findMany({
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
        return results.map(mapPrismaToSale);
    },

    count: async (filters: SaleFilters & { paymentMethod?: string } = {}): Promise<number> => {
        const where: any = {};

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

    create: async (data: CreateSaleData): Promise<Sale> => {
        const result = await prisma.sale.create({
            data: {
                total: data.total,
                paymentMethod: data.paymentMethod,
                userId: data.userId,
                clientId: data.clientId,
            },
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
        return mapPrismaToSale(result);
    },

    createItems: async (items: Array<{ saleId: string; medicineId: string; quantity: number; unitPrice: number }>): Promise<any> => {
        return await prisma.saleItem.createMany({
            data: items,
        });
    },

    updateMedicinesStock: async (updates: StockUpdate[]): Promise<any[]> => {
        const promises = updates.map(({ id, decrement }) =>
            prisma.medicine.update({
                where: { id },
                data: { stock: { decrement } },
            })
        );
        return await Promise.all(promises);
    },
};