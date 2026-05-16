import { api, ApiError } from './api'

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'SOLO_LECTURA'
  avatar?: string
  avatarColor: string
  team?: string
}

interface LoginResponse {
  user: User
}

interface RegisterResponse {
  user: User
}

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password })
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed')
    }
    return response.data.user
  },

  async register(data: { email: string; password: string; name: string }): Promise<User> {
    const response = await api.post<RegisterResponse>('/auth/register', data)
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed')
    }
    return response.data.user
  },

  async logout(): Promise<void> {
    const response = await api.post<{ message: string }>('/auth/logout', {})
    if (!response.success) {
      throw new Error(response.message || 'Logout failed')
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get current user')
    }
    return response.data
  },

  async refreshToken(): Promise<void> {
    const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
      refreshToken: '', // Cookie will be sent automatically
    })
    if (!response.success) {
      throw new Error('Token refresh failed')
    }
  },
}

export { ApiError }