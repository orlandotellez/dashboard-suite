import { clientRepository } from '../infrastructure/client.repository.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../../core/errors/AppError.js';
import { CreateClientDto, UpdateClientDto, ClientFilters, PaginatedResponse, Client } from '../../../types/index.js';

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

interface ClientWithHistory extends Client {
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

export const clientService = {
    findAll: async (queryParams: ClientFilters & { page?: number; limit?: number; q?: string }): Promise<PaginatedResponse<Client>> => {
        const { q, membership, page = 1, limit = 10 } = queryParams;
        const skip = (Number(page) - 1) * Number(limit);

        const filters: ClientFilters = {};
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

    findById: async (id: string): Promise<ClientWithHistory> => {
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

    create: async (data: CreateClientDto): Promise<Client> => {
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

    update: async (id: string, data: UpdateClientDto): Promise<Client> => {
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

    delete: async (id: string): Promise<void> => {
        const client = await clientRepository.findById(id);
        if (!client) {
            throw new NotFoundError('Client not found');
        }

        await clientRepository.softDelete(id);
    },
};