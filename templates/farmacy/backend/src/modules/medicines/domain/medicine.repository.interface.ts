import { Medicine, CreateMedicineDto, UpdateMedicineDto, UpdateStockDto, MedicineFilters } from '../../../types/index.js';

// IMedicineRepository interface
// This defines the contract for medicine data access

export interface IMedicineRepository {
    findById(id: string): Promise<Medicine | null>;
    findAllActive(filters: MedicineFilters, skip?: number, take?: number): Promise<Medicine[]>;
    countActive(filters: MedicineFilters): Promise<number>;
    create(data: CreateMedicineDto): Promise<Medicine>;
    update(id: string, data: UpdateMedicineDto): Promise<Medicine>;
    updateStock(id: string, stock: number): Promise<Medicine>;
    incrementStock(id: string, amount: number): Promise<Medicine>;
    decrementStock(id: string, amount: number): Promise<Medicine>;
    softDelete(id: string): Promise<Medicine>;
}

export const medicineRepositoryContract: IMedicineRepository = {
    findById: async (id: string) => { return null; },
    findAllActive: async (filters: MedicineFilters, skip = 0, take = 10) => { return []; },
    countActive: async (filters: MedicineFilters) => { return 0; },
    create: async (data: CreateMedicineDto) => { return {} as Medicine; },
    update: async (id: string, data: UpdateMedicineDto) => { return {} as Medicine; },
    updateStock: async (id: string, stock: number) => { return {} as Medicine; },
    incrementStock: async (id: string, amount: number) => { return {} as Medicine; },
    decrementStock: async (id: string, amount: number) => { return {} as Medicine; },
    softDelete: async (id: string) => { return {} as Medicine; },
};