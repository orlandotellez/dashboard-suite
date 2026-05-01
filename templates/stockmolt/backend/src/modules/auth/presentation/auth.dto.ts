import { z } from "zod"

const RegisterDtoSchema = z.object({
  email: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2),
})

export const LoginDtoSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>
export type LoginDto = z.infer<typeof LoginDtoSchema>
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>
