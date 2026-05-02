import { create } from 'zustand'

export interface Medicine {
  id: string
  name: string
  price: number
  stock: number
  category: string
  minStock: number
}

export interface DashboardStats {
  dailySales: number
  topSelling: Medicine[]
  lowStock: Medicine[]
  totalProducts: number
  totalClients: number
}

interface PharmacyState {
  medicines: Medicine[]
  stats: DashboardStats
  searchQuery: string
  setSearchQuery: (query: string) => void
  getFilteredMedicines: () => Medicine[]
}

// Datos de ejemplo (Mock Data)
const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', price: 5.50, stock: 120, category: 'Analgésicos', minStock: 50 },
  { id: '2', name: 'Ibuprofeno 400mg', price: 7.20, stock: 85, category: 'Antiinflamatorios', minStock: 40 },
  { id: '3', name: 'Amoxicilina 500mg', price: 12.30, stock: 15, category: 'Antibióticos', minStock: 30 },
  { id: '4', name: 'Loratadina 10mg', price: 8.90, stock: 200, category: 'Antialérgicos', minStock: 50 },
  { id: '5', name: 'Omeprazol 20mg', price: 9.50, stock: 8, category: 'Antiácidos', minStock: 25 },
  { id: '6', name: 'Salbutamol Inhalador', price: 15.00, stock: 45, category: 'Respiratorios', minStock: 20 },
  { id: '7', name: 'Metformina 850mg', price: 10.20, stock: 60, category: 'Antidiabéticos', minStock: 30 },
  { id: '8', name: 'Simvastatina 20mg', price: 11.80, stock: 5, category: 'Cardiovascular', minStock: 20 },
]

const mockStats: DashboardStats = {
  dailySales: 1245.50,
  topSelling: [mockMedicines[0], mockMedicines[3], mockMedicines[1]],
  lowStock: [mockMedicines[4], mockMedicines[7], mockMedicines[2]],
  totalProducts: 156,
  totalClients: 89
}

export const usePharmacyStore = create<PharmacyState>((set, get) => ({
  medicines: mockMedicines,
  stats: mockStats,
  searchQuery: '',
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredMedicines: () => {
    const { medicines, searchQuery } = get()
    if (!searchQuery) return medicines
    return medicines.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
}))
