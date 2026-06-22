import { prisma } from '../../../config/prisma.js';
import { UserWithoutPassword, Role } from '../../../types/index.js';

interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role?: string;
}

interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
}

// Helper to map Prisma user to UserWithoutPassword
const mapToUserWithoutPassword = (user: {
    id: string;
    name: string;
    email: string;
    role: Role;
}): UserWithoutPassword => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
});

export const userRepository = {
    findByEmail: async (email: string) => {
        return await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
    },

    findById: async (id: string): Promise<UserWithoutPassword | null> => {
        const user = await prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!user) return null;
        return mapToUserWithoutPassword(user);
    },

    findAllActive: async (skip = 0, take = 10): Promise<UserWithoutPassword[]> => {
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            skip,
            take,
        });
        return users.map(mapToUserWithoutPassword);
    },

    countActive: async (): Promise<number> => {
        return await prisma.user.count({
            where: { deletedAt: null },
        });
    },

    create: async (data: CreateUserData): Promise<UserWithoutPassword> => {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role as Role,
            },
        });
        return mapToUserWithoutPassword(user);
    },

    update: async (id: string, data: UpdateUserData): Promise<UserWithoutPassword> => {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role as Role,
            },
        });
        return mapToUserWithoutPassword(user);
    },

    softDelete: async (id: string): Promise<any> => {
        return await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },
};