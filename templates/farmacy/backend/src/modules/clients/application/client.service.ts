import { clientRepository } from '../infrastructure/client.repository.js';
import { ConflictError, NotFoundError, ForbiddenError } from '@/core/errors/AppError.js';

export const clientService = {
    findAll: async (queryParams) => {
        const { q, membership, page = 1, limit = 10 } = queryParams;
        const skip = (Number(page) - 1) * Number(limit);

        const filters = {};
        if (q) filters.search = q;
        if (membership) filters.membership = membership;

        const clients = await clientRepository.findAllActive(filters, skip, Number(limit));
        const total = await clientRepository.countActive(filters);
        const totalPages = Math.ceil(total / Number(limit));

        return {
            data: clients,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
        };
    },

    findById: async (id) => {
        const client = await clientRepository.findById(id);
        if (!client) {
            throw new NotFoundError('Client not found');
        }

        const purchaseHistory = await clientRepository.getPurchaseHistory(id);

        return {
            ...client,
            ...purchaseHistory,
        };
    },

    create: async (data) => {
        const existingClient = await clientRepository.findByDocumentNumber(data.documentNumber);
        if (existingClient && !existingClient.deletedAt) {
            throw new ConflictError('Document number already registered');
        }

        return await clientRepository.create({
            name: data.name,
            documentNumber: data.documentNumber,
            email: data.email,
            phone: data.phone,
            address: data.address,
            membership: data.membership || 'bronze',
        });
    },

    update: async (id, data) => {
        const client = await clientRepository.findById(id);
        if (!client) {
            throw new NotFoundError('Client not found');
        }

        if (data.documentNumber) {
            throw new ForbiddenError('Document number cannot be changed');
        }

        if (data.email) {
            const existingClient = await clientRepository.findByEmail(data.email);
            if (existingClient && existingClient.id !== id) {
                throw new ConflictError('Email already in use');
            }
        }

        return await clientRepository.update(id, {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            membership: data.membership,
        });
    },

    delete: async (id) => {
        const client = await clientRepository.findById(id);
        if (!client) {
            throw new NotFoundError('Client not found');
        }

        return await clientRepository.softDelete(id);
    },
};