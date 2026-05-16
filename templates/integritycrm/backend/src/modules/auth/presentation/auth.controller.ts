import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../application/auth.service.js'
import { authRepository } from '../infrastructure/auth.repository.js'
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  refreshTokenSchema,
  LoginDTO,
  RegisterDTO,
  ChangePasswordDTO,
  RefreshTokenDTO,
} from './auth.dto.js'

const authService = new AuthService({ authRepository })

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export const authController = {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as LoginDTO
    loginSchema.parse(body)

    const result = await authService.login(body.email, body.password)

    // Set cookies
    reply.setCookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    })

    reply.setCookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return reply.send({
      success: true,
      data: {
        user: result.user,
      },
    })
  },

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as RegisterDTO
    registerSchema.parse(body)

    const result = await authService.register(body)

    // Set cookies
    reply.setCookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    })

    reply.setCookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return reply.status(201).send({
      success: true,
      data: {
        user: result.user,
      },
    })
  },

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as RefreshTokenDTO
    refreshTokenSchema.parse(body)

    const result = await authService.refreshToken(body.refreshToken)

    return reply.send({
      success: true,
      data: result,
    })
  },

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ChangePasswordDTO
    changePasswordSchema.parse(body)

    const userId = request.user!.id

    await authService.changePassword(userId, body.currentPassword, body.newPassword)

    return reply.send({
      success: true,
      message: 'Password changed successfully',
    })
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user!

    return reply.send({
      success: true,
      data: user,
    })
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('accessToken', COOKIE_OPTIONS)
    reply.clearCookie('refreshToken', COOKIE_OPTIONS)

    return reply.send({
      success: true,
      message: 'Logged out successfully',
    })
  },
}