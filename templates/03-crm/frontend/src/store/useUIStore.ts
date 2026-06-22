import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notificationsOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  toggleSidebar: () => void
  setCommandPalette: (open: boolean) => void
  setNotifications: (open: boolean) => void
  openModal: (modal: string) => void
  closeModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notificationsOpen: false,
  activeModal: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandPalette: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setNotifications: (notificationsOpen) => set({ notificationsOpen }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))