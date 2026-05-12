// IUserRepository interface
// This defines the contract for user data access

export const IUserRepository = {
    findByEmail: async (email: string) => {},
    findById: async (id: string) => {},
    findAllActive: async () => {},
    create: async (data: any) => {},
    update: async (id: string, data: any) => {},
    softDelete: async (id: string) => {},
};