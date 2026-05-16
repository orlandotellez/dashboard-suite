import { User } from '../../../types/index.js'

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  updatePassword(userId: string, newPassword: string): Promise<void>
}