import bcrypt from 'bcrypt';
import { userRepository } from '../infrastructure/user.repository.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../../core/errors/AppError.js';

const SALT_ROUNDS = 10;

export const userService = {
    findAll: async (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const users = await userRepository.findAllActive(skip, limit);
        const total = await userRepository.countActive();
        const totalPages = Math.ceil(total / limit);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    },

    findById: async (id: string) => {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    },

    create: async (data: any) => {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        return await userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role || 'staff',
        });
    },

    update: async (id: string, data: any, currentUserId: string) => {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (currentUserId === id && data.role) {
            throw new ForbiddenError('Cannot change your own role');
        }

        if (data.email) {
            const existingUser = await userRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== id) {
                throw new ConflictError('Email already in use');
            }
        }

        const updateData = { ...data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        }

        return await userRepository.update(id, updateData);
    },

    delete: async (id: string, currentUserId: string) => {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (currentUserId === id) {
            throw new ForbiddenError('Cannot delete your own account');
        }

        return await userRepository.softDelete(id);
    },
};