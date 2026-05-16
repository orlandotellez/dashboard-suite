import { prisma } from '../../../config/prisma.js'
import { IAuthRepository } from '../domain/auth.repository.interface.js'
import { User, Role } from '../../../types/index.js'

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) return null

    return user as User
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) return null

    return user as User
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role as Role,
        avatar: data.avatar,
        avatarColor: data.avatarColor,
        team: data.team,
        active: data.active,
      },
    })

    return user as User
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    })
  }
}

export const authRepository = new AuthRepository()