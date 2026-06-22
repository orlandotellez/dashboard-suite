import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  role: z.enum(['ADMIN', 'MANAGER', 'VENDEDOR', 'STAFF', 'SOLO_LECTURA']).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type LoginDTO = z.infer<typeof loginSchema>
export type RegisterDTO = z.infer<typeof registerSchema>
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>