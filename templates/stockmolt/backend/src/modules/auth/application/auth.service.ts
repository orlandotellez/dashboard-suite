import { IUserRepository } from "@/modules/users/domain/user.repository"
import { FastifyInstance } from "fastify"
import bcrypt from 'bcrypt'
import crypto from 'crypto';
import { env } from "@/config/env"
import { isRedisConnected, redis } from "@/infrastructure/redis";
import { logger } from "@/infrastructure/logger";
import { LoginDto, RegisterDto } from "../presentation/auth.dto";
import { ConflictError, UnauthorizedError } from "@/core/errors/AppError";
import { Role } from "@prisma/client";

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly app: FastifyInstance
  ) { }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  private async generateTokens(userId: string, role: string) {
    const accessToken = this.app.jwt.sign(
      { sub: userId, role },
      { expiresIn: env?.JWT_EXPIRES_IN }
    )

    const refreshToken = crypto.randomBytes(40).toString("hex")

    if (isRedisConnected()) {
      const expireTime = 7 * 24 * 60 * 60
      await redis.set(`refresh_token:${refreshToken}`, userId, `EX`, expireTime)
    } else {
      logger.warn("Redis not available - refresh tokens disabled")
    }

    return { accessToken, refreshToken }
  }

  async register_user(data: RegisterDto) {
    // verificamos si el usuario existe 
    const existingUser = await this.userRepository.findByEmail(data.email)

    if (existingUser) {
      throw new ConflictError("User alreadly exists")
    }

    // hashear contraseña del usuario
    const hashedPassword = await this.hashPassword(data.password)

    // crear el usuario por defecto con el rol de USER 
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: Role.USER
    })

    return user
  }

  async login_user(data: LoginDto) {
    // buscamos el usuario por el email
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      throw new ConflictError("Invalid credentials")
    }

    // verificamos la contraseña 
    const isMatch = await bcrypt.compare(data.password, user.password)

    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials")
    }

    // generar los tokens 
    const tokens = await this.generateTokens(user.id, user.role)

    // retornar sin contraseña con esta sintaxis
    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      tokens
    }

  }

  async refresh_token(refreshToken: string) {
    if (!isRedisConnected()) {
      throw new UnauthorizedError('Refresh tokens unavailable - Redis not connected');
    }

    // buscar userId en redis 
    const userId = await redis.get(`refresh_token:${refreshToken}`);

    if (!userId) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // obtener el usuario 
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    // invalidar old refresh token(token rotation)
    await redis.del(`refresh_token:${refreshToken}`)

    // generar nuevos tokens 
    return this.generateTokens(user.id, user.role)
  }

  async logout(refreshToken: string) {
    if (!isRedisConnected()) {
      throw new UnauthorizedError("Logout unavailable - Redis not connected")
    }

    // extrear el token 
    const key = `refresh_token:${refreshToken}`

    // verificar si existe el token
    const exists = await redis.exists(key)

    if (!exists) {
      throw new UnauthorizedError("Invalid refresh token")
    }

    // si el token existe borrar
    await redis.del(key)

    return {
      message: "Logged out successfully"
    }
  }
}

