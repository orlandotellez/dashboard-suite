import { Role } from './user.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RefreshPayload {
  userId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}