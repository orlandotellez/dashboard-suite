import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { IAuthRepository } from '../domain/auth.repository.interface.js'
import { User, Role } from '../../../types/index.js'
import { UnauthorizedError, BadRequestError, ConflictError } from '../../../core/errors/AppError.js'
import { config } from '../../../config/env.js'
import { tokenBlacklist } from '../../../infrastructure/auth/tokenBlacklist.js'
import jwt from 'jsonwebtoken'

export interface AuthServiceDeps {
  authRepository: IAuthRepository
}

export interface LoginResponse {
  user: Omit<User, 'password'>
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private authRepository: IAuthRepository

  constructor(deps: AuthServiceDeps) {
    this.authRepository = deps.authRepository
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.authRepository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    if (!user.active) {
      throw new UnauthorizedError('Account is inactive')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const tokens = this.generateTokens(user)

    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      ...tokens,
    }
  }

  async register(data: {
    email: string
    password: string
    name: string
    role?: Role
  }): Promise<LoginResponse> {
    const existingUser = await this.authRepository.findByEmail(data.email)

    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await this.authRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'VENDEDOR',
      avatarColor: '#2563EB',
      active: true,
    })

    const tokens = this.generateTokens(user)

    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      ...tokens,
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        sub: string
        email: string
        name: string
        role: string
      }

      const user = await this.authRepository.findById(decoded.sub)

      if (!user || !user.active) {
        throw new UnauthorizedError('Invalid refresh token')
      }

      return this.generateTokens(user)
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.authRepository.findById(userId)

    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await this.authRepository.updatePassword(userId, hashedPassword)
  }

  async logout(accessToken: string): Promise<void> {
    try {
      // Decode token to get jti
      const decoded = jwt.decode(accessToken) as { jti?: string } | null

      if (decoded?.jti) {
        // Blacklist the access token
        await tokenBlacklist.add(decoded.jti)
      }
    } catch (error) {
      // If we can't decode the token, just continue with logout
      console.warn('Failed to blacklist token on logout:', error)
    }
  }

  async logoutAll(userId: string): Promise<void> {
    // Revoke all tokens for this user
    await tokenBlacklist.revokeUserTokens(userId)
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const jti = randomUUID()

    // jti is included in payload, jsonwebtoken automatically adds it to the token
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti,
    }

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiry,
    })

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    })

    return { accessToken, refreshToken }
  }
}
