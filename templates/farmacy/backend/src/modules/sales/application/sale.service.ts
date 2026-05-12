import { prisma } from '../../../config/prisma.js';
import { medicineRepository } from '../../medicines/infrastructure/medicine.repository.js';
import { saleRepository } from '../infrastructure/sale.repository.js';
import { NotFoundError, ForbiddenError } from '../../../core/errors/AppError.js';
import { CreateSaleDto, SaleFilters, PaginatedResponse, Sale } from '../../../types/index.js';

export const saleService = {
    register: async (data: CreateSaleDto, userId: string | undefined) => {
        const { clientId, items } = data;

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        // Verify medicines exist and have sufficient stock
        const medicineIds = items.map(item => item.medicineId);
        const medicines = await prisma.medicine.findMany({
            where: {
                id: { in: medicineIds },
                deletedAt: null,
            },
        });

        if (medicines.length !== medicineIds.length) {
            const foundIds = medicines.map(m => m.id);
            const missingIds = medicineIds.filter(id => !foundIds.includes(id));
            throw new NotFoundError(`Medicine not found: ${missingIds.join(', ')}`);
        }

        // Check stock availability
        for (const item of items) {
            const medicine = medicines.find(m => m.id === item.medicineId);
            if (medicine && medicine.stock < item.quantity) {
                throw new ForbiddenError(
                    `Insufficient stock for medicine: ${medicine.tradeName} (available: ${medicine.stock}, requested: ${item.quantity})`
                );
            }
        }

        // Use transaction for atomicity
        const sale = await prisma.$transaction(async (tx) => {
            // Create sale
            const newSale = await tx.sale.create({
                data: {
                    total,
                    paymentMethod: data.paymentMethod,
                    userId: userId!,
                    clientId,
                    items: {
                        create: items.map(item => ({
                            medicineId: item.medicineId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                        })),
                    },
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
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

            // Update medicine stock
            for (const item of items) {
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return newSale;
        });

        return sale;
    },

    findAll: async (queryParams: SaleFilters & { page?: number; limit?: number; paymentMethod?: string }): Promise<PaginatedResponse<Sale>> => {
        const { startDate, endDate, clientId, userId, paymentMethod, page = 1, limit = 10 } = queryParams;
        const skip = (Number(page) - 1) * Number(limit);

        const filters: SaleFilters & { paymentMethod?: string } = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (clientId) filters.clientId = clientId;
        if (userId) filters.userId = userId;
        if (paymentMethod) filters.paymentMethod = paymentMethod;

        const sales = await saleRepository.findAll(filters, skip, Number(limit));
        const total = await saleRepository.count(filters);
        const totalPages = Math.ceil(total / Number(limit));

        return {
            data: sales,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
        };
    },

    findById: async (id: string): Promise<Sale | null> => {
        const sale = await saleRepository.findById(id);
        if (!sale) {
            throw new NotFoundError('Sale not found');
        }
        return sale;
    },
};