import { Sale, SaleFilters, CreateSaleItemDto } from '../../../types/index.js';

// ISaleRepository interface
// This defines the contract for sale data access

export interface ISaleRepository {
    findById(id: string): Promise<Sale | null>;
    findAll(filters: SaleFilters & { paymentMethod?: string }, skip?: number, take?: number): Promise<Sale[]>;
    count(filters: SaleFilters & { paymentMethod?: string }): Promise<number>;
    create(data: { total: number; paymentMethod: string; userId?: string; clientId?: string }): Promise<Sale>;
    createItems(items: CreateSaleItemDto[]): Promise<any>;
    updateMedicinesStock(updates: Array<{ id: string; decrement: number }>): Promise<any[]>;
}

export const saleRepositoryContract: ISaleRepository = {
    findById: async (id: string) => { return null; },
    findAll: async (filters: SaleFilters & { paymentMethod?: string }, skip = 0, take = 10) => { return []; },
    count: async (filters: SaleFilters & { paymentMethod?: string }) => { return 0; },
    create: async (data) => { return {} as Sale; },
    createItems: async (items: CreateSaleItemDto[]) => { return {}; },
    updateMedicinesStock: async (updates: Array<{ id: string; decrement: number }>) => { return []; },
};