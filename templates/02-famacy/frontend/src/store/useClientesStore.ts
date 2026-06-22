import { create } from 'zustand'
import { Cliente } from '../types/pharmacy'
import { api } from '../services/api'

// Mapper: Backend -> Frontend
const mapClienteFromBackend = (backendCliente: any): Cliente => ({
  id: backendCliente.id,
  nombre: backendCliente.name || backendCliente.nombre,
  dni: backendCliente.documentNumber || backendCliente.dni || '',
  telefono: backendCliente.phone || backendCliente.telefono || '',
  email: backendCliente.email || '',
  direccion: backendCliente.address || backendCliente.direccion || '',
})

interface ClientesState {
  clientes: Cliente[]
  searchQuery: string
  isLoading: boolean
  error: string | null
  setSearchQuery: (query: string) => void
  fetchClientes: () => Promise<void>
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<{ success: boolean; error?: string }>
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<boolean>
  deleteCliente: (id: string) => Promise<boolean>
  getFilteredClientes: () => Cliente[]
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  searchQuery: '',
  isLoading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchClientes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get<{ data: any[] }>('/clients')
      const clientes = (response.data || []).map(mapClienteFromBackend)
      set({ clientes, isLoading: false })
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      set({ error: error.message || 'Error al cargar clientes', isLoading: false })
    }
  },

  addCliente: async (cliente) => {
    try {
      const payload = {
        name: cliente.nombre,
        documentNumber: cliente.dni,
        email: cliente.email,
        phone: cliente.telefono,
        address: cliente.direccion,
      }

      const response = await api.post<any>('/clients', payload)
      const newCliente = mapClienteFromBackend(response)

      set((state) => ({
        clientes: [...state.clientes, newCliente]
      }))

      return { success: true }
    } catch (error: any) {
      console.error('Error adding client:', error)
      const errorMessage = error.body?.message || error.message || 'Error al agregar cliente'

      // Check if it's a duplicate document number error
      if (error.status === 409 || errorMessage.includes('already exists')) {
        return { success: false, error: 'Ya existe un cliente con este DNI' }
      }

      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  updateCliente: async (id, cliente) => {
    try {
      const payload: any = {}
      if (cliente.nombre) payload.name = cliente.nombre
      if (cliente.email !== undefined) payload.email = cliente.email
      if (cliente.telefono !== undefined) payload.phone = cliente.telefono
      if (cliente.direccion !== undefined) payload.address = cliente.direccion

      const response = await api.put<any>(`/clients/${id}`, payload)
      const updatedCliente = mapClienteFromBackend(response)

      set((state) => ({
        clientes: state.clientes.map(c => c.id === id ? updatedCliente : c)
      }))

      return true
    } catch (error: any) {
      console.error('Error updating client:', error)
      set({ error: error.message || 'Error al actualizar cliente' })
      return false
    }
  },

  deleteCliente: async (id) => {
    try {
      await api.delete(`/clients/${id}`)
      set((state) => ({
        clientes: state.clientes.filter(c => c.id !== id)
      }))
      return true
    } catch (error: any) {
      console.error('Error deleting client:', error)
      set({ error: error.message || 'Error al eliminar cliente' })
      return false
    }
  },

  getFilteredClientes: () => {
    const { clientes, searchQuery } = get()
    if (!searchQuery) return clientes
    const query = searchQuery.toLowerCase()
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(query) ||
      c.dni.includes(query) ||
      c.email.toLowerCase().includes(query)
    )
  }
}))
