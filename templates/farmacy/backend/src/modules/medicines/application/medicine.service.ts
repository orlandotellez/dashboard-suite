import { medicineRepository } from '../infrastructure/medicine.repository.js';
import { NotFoundError, ForbiddenError } from '../../../core/errors/AppError.js';

export const medicineService = {
    findAll: async (queryParams: any) => {
        const { q, laboratoryId, categoryId, stockStatus, page = 1, limit = 10 } = queryParams;
        const skip = (Number(page) - 1) * Number(limit);

        const filters: any = {};
        if (q) filters.search = q;
        if (laboratoryId) filters.laboratoryId = laboratoryId;
        if (categoryId) filters.categoryId = categoryId;
        if (stockStatus) filters.stockStatus = stockStatus;

        const medicines = await medicineRepository.findAllActive(filters, skip, Number(limit));
        const total = await medicineRepository.countActive(filters);
        const totalPages = Math.ceil(total / Number(limit));

        return {
            data: medicines,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
        };
    },

    findById: async (id: string) => {
        const medicine = await medicineRepository.findById(id);
        if (!medicine) {
            throw new NotFoundError('Medicine not found');
        }
        return medicine;
    },

    create: async (data: any) => {
        return await medicineRepository.create({
            tradeName: data.tradeName,
            genericName: data.genericName,
            description: data.description,
            price: data.price,
            stock: data.stock || 0,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            laboratoryId: data.laboratoryId,
            categoryId: data.categoryId,
        });
    },

    update: async (id: string, data: any) => {
        const medicine = await medicineRepository.findById(id);
        if (!medicine) {
            throw new NotFoundError('Medicine not found');
        }

        if (data.stock !== undefined) {
            throw new ForbiddenError('Use PATCH /medicines/:id/stock to update stock');
        }

        return await medicineRepository.update(id, {
            tradeName: data.tradeName,
            genericName: data.genericName,
            description: data.description,
            price: data.price,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            laboratoryId: data.laboratoryId,
            categoryId: data.categoryId,
        });
    },

    updateStock: async (id: string, stockData: any) => {
        const medicine = await medicineRepository.findById(id);
        if (!medicine) {
            throw new NotFoundError('Medicine not found');
        }

        if (stockData.stock !== undefined) {
            if (stockData.stock < 0) {
                throw new ForbiddenError('Stock cannot be negative');
            }
            return await medicineRepository.updateStock(id, stockData.stock);
        }

        if (stockData.increment !== undefined) {
            return await medicineRepository.incrementStock(id, stockData.increment);
        }

        if (stockData.decrement !== undefined) {
            const newStock = medicine.stock - stockData.decrement;
            if (newStock < 0) {
                throw new ForbiddenError('Stock cannot be negative');
            }
            return await medicineRepository.decrementStock(id, stockData.decrement);
        }

        throw new ForbiddenError('No valid stock operation provided');
    },

    delete: async (id: string) => {
        const medicine = await medicineRepository.findById(id);
        if (!medicine) {
            throw new NotFoundError('Medicine not found');
        }

        return await medicineRepository.softDelete(id);
    },
};