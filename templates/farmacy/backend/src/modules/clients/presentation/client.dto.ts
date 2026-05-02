const { z } = require('zod');

const CreateClientDtoSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    documentNumber: z.string().min(5, 'Document number must be at least 5 characters'),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    membership: z.enum(['bronze', 'silver', 'gold']).optional(),
});

const UpdateClientDtoSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    membership: z.enum(['bronze', 'silver', 'gold']).optional(),
});

module.exports = { CreateClientDtoSchema, UpdateClientDtoSchema };
