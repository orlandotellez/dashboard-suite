import type { FastifyInstance } from "fastify"
import { authController } from "./auth.controller"
import { authGuard, adminGuard } from "@/core/guard/auth.guard"

export const authRoutes = async (fastify: FastifyInstance, _options: any) => {
  // PUBLIC ROUTES
  fastify.post("/register", { preHandler: [authGuard, adminGuard] }, authController.register)
  fastify.post("/login", authController.login)
  fastify.post("/refresh", authController.refresh)
  fastify.post("/logout", authController.logout)

  // Email Verification
  fastify.post("/verify-email", authController.verifyEmail)
  fastify.post("/resend-verification", authController.resendVerification)

  // Password Reset
  fastify.post("/forgot-password", authController.forgotPassword)
  fastify.post("/reset-password", authController.resetPassword)

  // PROTECTED ROUTES
  fastify.get(
    "/sessions",
    {
      preHandler: authGuard
    },
    authController.getUserSessions
  )

  fastify.delete(
    "/sessions/:sessionId",
    {
      preHandler: authGuard
    },
    authController.revokeSession
  )
}
