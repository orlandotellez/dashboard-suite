const { z } = require('zod');

const CreateMedicineDtoSchema = z.object({
    tradeName: z.string().min(2, 'Trade name must be at least 2 characters'),
    genericName: z.string().min(2, 'Generic name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0).optional(),
    expiryDate: z.string().datetime().optional(),
    laboratoryId: z.string().min(1, 'Laboratory is required'),
    categoryId: z.string().min(1, 'Category is required'),
});

const UpdateMedicineDtoSchema = z.object({
    tradeName: z.string().min(2, 'Trade name must be at least 2 characters').optional(),
    genericName: z.string().min(2, 'Generic name must be at least 2 characters').optional(),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive').optional(),
    expiryDate: z.string().datetime().optional(),
    laboratoryId: z.string().min(1, 'Laboratory is required').optional(),
    categoryId: z.string().min(1, 'Category is required').optional(),
});

const UpdateStockDtoSchema = z.object({
    stock: z.number().int().min(0).optional(),
    increment: z.number().int().positive().optional(),
    decrement: z.number().int().positive().optional(),
}).refine(data => {
    const count = [data.stock, data.increment, data.decrement].filter(v => v !== undefined).length;
    return count === 1;
}, { message: 'Exactly one of stock, increment, or decrement must be provided' });

module.exports = { CreateMedicineDtoSchema, UpdateMedicineDtoSchema, UpdateStockDtoSchema };
