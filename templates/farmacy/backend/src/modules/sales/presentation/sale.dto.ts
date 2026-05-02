const { z } = require('zod');

const SaleItemDtoSchema = z.object({
    medicineId: z.string().min(1, 'Medicine ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
});

const CreateSaleDtoSchema = z.object({
    clientId: z.string().optional(),
    items: z.array(SaleItemDtoSchema).min(1, 'At least one item is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    total: z.number().positive('Total must be positive'),
});

module.exports = { CreateSaleDtoSchema, SaleItemDtoSchema };
