import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthState, AuthResponse } from '../types/auth'
import { api, ApiFetchError } from '../services/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        try {
          const response = await api.post<AuthResponse>('/auth/login', { email, password })

          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })

          return true
        } catch (error) {
          console.error('Login failed:', error)
          return false
        }
      },

      logout: async () => {
        try {
          const token = get().accessToken
          if (token) {
            await api.post('/auth/logout')
          }
        } catch (error) {
          console.error('Logout request failed:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
