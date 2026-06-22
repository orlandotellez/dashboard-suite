import { prisma } from '../../../config/prisma.js';
import { Medicine, MedicineFilters } from '../../../types/index.js';

// Helper to convert Prisma Decimal to number
const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value.toNumber === 'function') return value.toNumber();
    return Number(value);
};

interface CreateMedicineData {
    tradeName: string;
    genericName: string;
    description?: string | null;
    price: number;
    stock: number;
    expiryDate?: Date | null;
    laboratoryId: string;
    categoryId: string;
}

interface UpdateMedicineData {
    tradeName?: string;
    genericName?: string;
    description?: string | null;
    price?: number;
    expiryDate?: Date | undefined;
    laboratoryId?: string;
    categoryId?: string;
}

const mapPrismaToMedicine = (data: any): Medicine => ({
    id: data.id,
    tradeName: data.tradeName,
    genericName: data.genericName,
    description: data.description,
    price: toNumber(data.price),
    stock: data.stock,
    expiryDate: data.expiryDate,
    laboratoryId: data.laboratoryId,
    categoryId: data.categoryId,
    laboratory: data.laboratory ? {
        id: data.laboratory.id,
        name: data.laboratory.name,
        deletedAt: data.laboratory.deletedAt,
    } : undefined,
    category: data.category ? {
        id: data.category.id,
        name: data.category.name,
    } : undefined,
    deletedAt: data.deletedAt,
});

export const medicineRepository = {
    findById: async (id: string): Promise<Medicine | null> => {
        const data = await prisma.medicine.findFirst({
            where: { id, deletedAt: null },
            include: {
                laboratory: true,
                category: true,
            },
        });
        return data ? mapPrismaToMedicine(data) : null;
    },

    findAllActive: async (filters: MedicineFilters = {}, skip = 0, take = 10): Promise<Medicine[]> => {
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

        const results = await prisma.medicine.findMany({
            where,
            skip,
            take,
            include: {
                laboratory: true,
                category: true,
            },
            orderBy: { tradeName: 'asc' },
        });
        return results.map(mapPrismaToMedicine);
    },

    countActive: async (filters: MedicineFilters = {}): Promise<number> => {
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

    create: async (data: CreateMedicineData): Promise<Medicine> => {
        const result = await prisma.medicine.create({
            data: {
                tradeName: data.tradeName,
                genericName: data.genericName,
                description: data.description,
                price: data.price,
                stock: data.stock,
                expiryDate: data.expiryDate,
                laboratoryId: data.laboratoryId,
                categoryId: data.categoryId,
            },
            include: {
                laboratory: true,
                category: true,
            },
        });
        return mapPrismaToMedicine(result);
    },

    update: async (id: string, data: UpdateMedicineData): Promise<Medicine> => {
        const result = await prisma.medicine.update({
            where: { id },
            data: {
                tradeName: data.tradeName,
                genericName: data.genericName,
                description: data.description,
                price: data.price,
                expiryDate: data.expiryDate,
                laboratoryId: data.laboratoryId,
                categoryId: data.categoryId,
            },
            include: {
                laboratory: true,
                category: true,
            },
        });
        return mapPrismaToMedicine(result);
    },

    updateStock: async (id: string, stock: number): Promise<Medicine> => {
        const result = await prisma.medicine.update({
            where: { id },
            data: { stock },
            include: {
                laboratory: true,
                category: true,
            },
        });
        return mapPrismaToMedicine(result);
    },

    incrementStock: async (id: string, amount: number): Promise<Medicine> => {
        const result = await prisma.medicine.update({
            where: { id },
            data: { stock: { increment: amount } },
            include: {
                laboratory: true,
                category: true,
            },
        });
        return mapPrismaToMedicine(result);
    },

    decrementStock: async (id: string, amount: number): Promise<Medicine> => {
        const result = await prisma.medicine.update({
            where: { id },
            data: { stock: { decrement: amount } },
            include: {
                laboratory: true,
                category: true,
            },
        });
        return mapPrismaToMedicine(result);
    },

    softDelete: async (id: string): Promise<Medicine> => {
        const result = await prisma.medicine.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return mapPrismaToMedicine(result);
    },
};