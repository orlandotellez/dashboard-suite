import type { FastifyReply, FastifyRequest } from "fastify"
import type { Role } from "@/types/auth"
import { clearAuthCookies } from "./cookie.utils"
import { env } from "@/config/env"
import jwt, { type JwtPayload } from "jsonwebtoken"

export const getUserIdFromCookies = (request: FastifyRequest): { userId: string | null; role: Role | null } => {
  const token = request.cookies.accessToken || request.cookies.refreshToken
  if (!token) return { userId: null, role: null }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & { userId?: string; role?: Role }
    return { userId: decoded.userId ?? null, role: decoded.role ?? null }
  } catch {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload & { userId?: string }
      return { userId: decoded.userId ?? null, role: null }
    } catch {
      return { userId: null, role: null }
    }
  }
}

export const resolveCurrentUserId = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<string | null> => {
  try {
    const { userId } = getUserIdFromCookies(request)
    return userId
  } catch {
    await clearAuthCookies(reply)
    return null
  }
}
