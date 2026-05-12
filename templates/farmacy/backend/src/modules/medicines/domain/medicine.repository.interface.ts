// IMedicineRepository interface
// This defines the contract for medicine data access

export const IMedicineRepository = {
    findById: async (id: string) => {},
    findAllActive: async (filters: any) => {},
    countActive: async (filters: any) => {},
    create: async (data: any) => {},
    update: async (id: string, data: any) => {},
    updateStock: async (id: string, stock: number) => {},
    incrementStock: async (id: string, amount: number) => {},
    decrementStock: async (id: string, amount: number) => {},
    softDelete: async (id: string) => {},
};