import { Client, CreateClientDto, UpdateClientDto, ClientFilters } from '../../../types/index.js';

// IClientRepository interface
// This defines the contract for client data access

export interface IClientRepository {
    findById(id: string): Promise<Client | null>;
    findByDocumentNumber(documentNumber: string): Promise<Client | null>;
    findByEmail(email: string): Promise<Client | null>;
    findAllActive(filters: ClientFilters, skip?: number, take?: number): Promise<Client[]>;
    countActive(filters: ClientFilters): Promise<number>;
    create(data: CreateClientDto): Promise<Client>;
    update(id: string, data: Partial<UpdateClientDto>): Promise<Client>;
    softDelete(id: string): Promise<Client>;
    getPurchaseHistory(id: string): Promise<{
        totalPurchases: number;
        totalSpent: number;
        lastPurchase: Date | null;
        sales: Array<{ id: string; date: Date; total: number; itemsCount: number }>;
    }>;
}

export const clientRepositoryContract: IClientRepository = {
    findById: async (id: string) => { return null; },
    findByDocumentNumber: async (documentNumber: string) => { return null; },
    findByEmail: async (email: string) => { return null; },
    findAllActive: async (filters: ClientFilters, skip = 0, take = 10) => { return []; },
    countActive: async (filters: ClientFilters) => { return 0; },
    create: async (data: CreateClientDto) => { return {} as Client; },
    update: async (id: string, data: Partial<UpdateClientDto>) => { return {} as Client; },
    softDelete: async (id: string) => { return {} as Client; },
    getPurchaseHistory: async (id: string) => {
        return {
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchase: null,
            sales: [],
        };
    },
};