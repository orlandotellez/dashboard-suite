const { prisma } = require('@/config/prisma');
const { medicineRepository } = require('@/modules/medicines/infrastructure/medicine.repository');
const { saleRepository } = require('../infrastructure/sale.repository');
const { NotFoundError, ForbiddenError } = require('@/core/errors/AppError');

const saleService = {
    register: async (data, userId) => {
        const { clientId, items, paymentMethod, total } = data;

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
            if (medicine.stock < item.quantity) {
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
                    paymentMethod,
                    userId,
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

    findAll: async (queryParams) => {
        const { startDate, endDate, clientId, paymentMethod, page = 1, limit = 10 } = queryParams;
        const skip = (Number(page) - 1) * Number(limit);

        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (clientId) filters.clientId = clientId;
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

    findById: async (id) => {
        const sale = await saleRepository.findById(id);
        if (!sale) {
            throw new NotFoundError('Sale not found');
        }
        return sale;
    },
};

module.exports = { saleService };
