import { CreateUserDto, UpdateUserDto, UserWithoutPassword } from '../../../types/index.js';

// IUserRepository interface
// This defines the contract for user data access

export interface IUserRepository {
    findByEmail(email: string): Promise<any | null>;
    findById(id: string): Promise<UserWithoutPassword | null>;
    findAllActive(skip?: number, take?: number): Promise<UserWithoutPassword[]>;
    countActive(): Promise<number>;
    create(data: { name: string; email: string; password: string; role?: string }): Promise<UserWithoutPassword>;
    update(id: string, data: { name?: string; email?: string; password?: string; role?: string }): Promise<UserWithoutPassword>;
    softDelete(id: string): Promise<any>;
}

export const userRepositoryContract: IUserRepository = {
    findByEmail: async (email: string) => { return null; },
    findById: async (id: string) => { return null; },
    findAllActive: async (skip = 0, take = 10) => { return []; },
    countActive: async () => { return 0; },
    create: async (data) => { return {} as UserWithoutPassword; },
    update: async (id: string, data) => { return {} as UserWithoutPassword; },
    softDelete: async (id: string) => {},
};