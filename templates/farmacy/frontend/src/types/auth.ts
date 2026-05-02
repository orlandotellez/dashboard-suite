export type Role = 'admin' | 'staff'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, role?: Role) => Promise<boolean>
  logout: () => Promise<void>
  // Funciones de mock eliminadas - ahora usamos backend real
}
