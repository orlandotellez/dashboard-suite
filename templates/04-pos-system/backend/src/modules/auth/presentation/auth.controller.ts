import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { createAuthService } from "../application/auth.service"
import { AuthRepository } from "../infrastructure/auth.prisma.repository"
import {
  LoginPayloadDtoSchema,
  RegisterPayloadDtoSchema,
  VerifyEmailDtoSchema,
  ForgotPasswordDtoSchema,
  ResetPasswordDtoSchema,
  ResendVerificationDtoSchema,
  RevokeSessionDtoSchema
} from "./auth.dto"
import { env } from "@/config/env"
import { clearAuthCookies, setAuthCookies } from "@/core/utils/cookie.utils"
import { ConflictError, UnauthorizedError } from "@/core/errors/AppError"
import { resolveCurrentUserId } from "@/core/utils/auth.utils"

const authService = createAuthService(AuthRepository)

function getRefreshToken(request: FastifyRequest): string {
  const cookieToken = request.cookies.refreshToken
  const body = request.body as Record<string, unknown> | undefined
  const bodyToken = typeof body?.refreshToken === "string" ? body.refreshToken : undefined
  return cookieToken || bodyToken || ""
}

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = RegisterPayloadDtoSchema.parse(request.body)

    const currentUserId = await resolveCurrentUserId(request, reply)

    if (currentUserId) {
      throw new ConflictError(
        "Already logged in. Please logout before creating a new account."
      )
    }

    const result = await authService.register(data)

    setAuthCookies(
      reply,
      result.accessToken,
      result.refreshToken,
      env.NODE_ENV === "production"
    )

    return reply.status(201).send({
      message: result.message,
      user: result.user
    })
  },

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = LoginPayloadDtoSchema.parse(request.body)

    const currentUserId = await resolveCurrentUserId(request, reply)

    const result = await authService.login(data)

    if (currentUserId && currentUserId === result.user.id) {
      throw new ConflictError("Already logged in with this user. Please logout first.")
    }

    if (currentUserId && currentUserId !== result.user.id) {
      await clearAuthCookies(reply)
    }

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    return reply.status(200).send({
      message: result.message,
      user: result.user
    })
  },

  logout: async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required")
    }

    const result = await authService.logout(refreshToken)

    clearAuthCookies(reply)

    return reply.status(200).send(result)
  },

  refresh: async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required")
    }

    const result = await authService.refresh(refreshToken)

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    return reply.status(200).send({ message: result.message })
  },

  verifyEmail: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = VerifyEmailDtoSchema.parse(request.body)

    const result = await authService.verifyEmail(data)

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    return reply.status(200).send({ message: result.message })
  },

  resendVerification: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = ResendVerificationDtoSchema.parse(request.body)

    const result = await authService.resendVerification(data.email)

    return reply.status(200).send({ message: result.message })
  },

  forgotPassword: async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = await resolveCurrentUserId(request, reply)
    if (currentUserId) {
      throw new ConflictError("Please logout before requesting password reset")
    }

    const data = ForgotPasswordDtoSchema.parse(request.body)

    const result = await authService.forgotPassword(data)

    return reply.status(200).send(result)
  },

  resetPassword: async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = await resolveCurrentUserId(request, reply)
    if (currentUserId) {
      throw new ConflictError("Please logout before resetting password")
    }

    const data = ResetPasswordDtoSchema.parse(request.body)

    const result = await authService.resetPassword(data)

    clearAuthCookies(reply)

    return reply.status(200).send(result)
  },

  getUserSessions: async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await resolveCurrentUserId(request, reply)

    if (!userId) {
      throw new UnauthorizedError("Authentication required")
    }

    const result = await authService.getUserSessions(userId)

    return reply.status(200).send(result)
  },

  revokeSession: async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await resolveCurrentUserId(request, reply)

    if (!userId) {
      throw new UnauthorizedError("Authentication required")
    }

    const params = request.params as { sessionId: string }
    const { sessionId } = RevokeSessionDtoSchema.parse(params)

    const result = await authService.revokeSession(userId, sessionId)

    return reply.status(200).send(result)
  }
}
