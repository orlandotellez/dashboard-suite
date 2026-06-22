import { create } from 'zustand'
import { Medicine, Laboratorio } from '../types/pharmacy'
import { api } from '../services/api'

// Mapper: Backend -> Frontend
const mapMedicineFromBackend = (backendMedicine: any): Medicine => ({
  id: backendMedicine.id,
  name: backendMedicine.tradeName || backendMedicine.name,
  principioActivo: backendMedicine.genericName || backendMedicine.principioActivo || '',
  laboratorioId: backendMedicine.laboratoryId || backendMedicine.laboratorioId || '',
  stock: backendMedicine.stock || 0,
  minStock: backendMedicine.minStock || 10, // Default min stock
  price: Number(backendMedicine.price) || 0,
  category: backendMedicine.category?.name || backendMedicine.category || 'Sin categoría',
})

interface InventarioState {
  medicines: Medicine[]
  laboratorios: Laboratorio[] // Keep mock data for now - backend doesn't have this endpoint
  searchQuery: string
  isLoading: boolean
  error: string | null
  setSearchQuery: (query: string) => void
  fetchMedicines: () => Promise<void>
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<boolean>
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<boolean>
  deleteMedicine: (id: string) => Promise<boolean>
  getFilteredMedicines: () => Medicine[]
  getLowStockMedicines: () => Medicine[]
}

export const useInventarioStore = create<InventarioState>((set, get) => ({
  medicines: [],
  laboratorios: [], // Keep mock data or fetch from backend if endpoint exists
  searchQuery: '',
  isLoading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchMedicines: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get<{ data: any[] }>('/medicines')
      const medicines = (response.data || []).map(mapMedicineFromBackend)
      set({ medicines, isLoading: false })
    } catch (error: any) {
      console.error('Error fetching medicines:', error)
      set({ error: error.message || 'Error al cargar medicamentos', isLoading: false })
    }
  },

  addMedicine: async (medicine) => {
    try {
      const payload = {
        tradeName: medicine.name,
        genericName: medicine.principioActivo,
        price: medicine.price,
        stock: medicine.stock,
        laboratoryId: medicine.laboratorioId,
        categoryId: medicine.category === 'Sin categoría' ? undefined : medicine.category,
      }

      const response = await api.post<any>('/medicines', payload)
      const newMedicine = mapMedicineFromBackend(response)

      set((state) => ({
        medicines: [...state.medicines, newMedicine]
      }))

      return true
    } catch (error: any) {
      console.error('Error adding medicine:', error)
      set({ error: error.message || 'Error al agregar medicamento' })
      return false
    }
  },

  updateMedicine: async (id, medicine) => {
    try {
      const payload: any = {}
      if (medicine.name) payload.tradeName = medicine.name
      if (medicine.principioActivo) payload.genericName = medicine.principioActivo
      if (medicine.price !== undefined) payload.price = medicine.price
      if (medicine.stock !== undefined) payload.stock = medicine.stock
      if (medicine.laboratorioId) payload.laboratoryId = medicine.laboratorioId

      const response = await api.put<any>(`/medicines/${id}`, payload)
      const updatedMedicine = mapMedicineFromBackend(response)

      set((state) => ({
        medicines: state.medicines.map(m => m.id === id ? updatedMedicine : m)
      }))

      return true
    } catch (error: any) {
      console.error('Error updating medicine:', error)
      set({ error: error.message || 'Error al actualizar medicamento' })
      return false
    }
  },

  deleteMedicine: async (id) => {
    try {
      await api.delete(`/medicines/${id}`)
      set((state) => ({
        medicines: state.medicines.filter(m => m.id !== id)
      }))
      return true
    } catch (error: any) {
      console.error('Error deleting medicine:', error)
      set({ error: error.message || 'Error al eliminar medicamento' })
      return false
    }
  },

  getFilteredMedicines: () => {
    const { medicines, searchQuery } = get()
    if (!searchQuery) return medicines
    const query = searchQuery.toLowerCase()
    return medicines.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.principioActivo.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query)
    )
  },

  getLowStockMedicines: () => {
    const { medicines } = get()
    return medicines.filter(m => m.stock <= m.minStock)
  }
}))
