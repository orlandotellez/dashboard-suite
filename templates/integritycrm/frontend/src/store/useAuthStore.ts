import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, User as AuthUser } from '@/api/auth'

export type Role = 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'SOLO_LECTURA'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  avatarColor: string
  team?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

// Demo mode - set to true to skip real API calls
const DEMO_MODE = true

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        if (DEMO_MODE) {
          // Demo mode - simulate login
          set({
            user: {
              id: '1',
              name: email.split('@')[0],
              email,
              role: 'ADMIN',
              avatarColor: '#2563EB',
            },
            isAuthenticated: true,
          })
          return
        }

        set({ isLoading: true })
        try {
          const user = await authApi.login(email, password)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: { email: string; password: string; name: string }) => {
        if (DEMO_MODE) {
          // Demo mode - simulate registration
          set({
            user: {
              id: Date.now().toString(),
              name: data.name,
              email: data.email,
              role: 'VENDEDOR',
              avatarColor: '#2563EB',
            },
            isAuthenticated: true,
          })
          return
        }

        set({ isLoading: true })
        try {
          const user = await authApi.register(data)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        if (!DEMO_MODE) {
          try {
            await authApi.logout()
          } catch {
            // Ignore logout errors
          }
        }
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: async () => {
        if (DEMO_MODE) {
          return // Skip in demo mode
        }

        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)