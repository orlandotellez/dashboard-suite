import { User as PrismaUser } from "@prisma/client"

export type User = Omit<PrismaUser, "password">
export type UserWithPassword = PrismaUser

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<UserWithPassword | null>
  create(data: Omit<PrismaUser, "id" | "created_at" | "updated_at" | "deleted_time">): Promise<User>
  update(id: string, data: Partial<PrismaUser>): Promise<User>
  softDelete(id: string): Promise<void>
}
