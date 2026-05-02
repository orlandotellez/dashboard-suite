import { create } from 'zustand'
import { Proveedor } from '../types/pharmacy'

interface ProveedoresState {
  proveedores: Proveedor[]
  addProveedor: (proveedor: Omit<Proveedor, 'id'>) => { success: boolean; error?: string }
  updateProveedor: (id: string, proveedor: Partial<Proveedor>) => void
  deleteProveedor: (id: string) => void
}

// Mock Data - Backend doesn't have suppliers endpoint yet
const mockProveedores: Proveedor[] = [
  { id: 'p1', nombreEmpresa: 'Distribuidora Norte S.A.', cuit: '30-12345678-9', telefono: '011-4000-1000', email: 'contacto@distronorte.com', direccion: 'Av. Libertador 5000', nombreContacto: 'Pedro Gómez' },
  { id: 'p2', nombreEmpresa: 'Farmacéutica Sur SRL', cuit: '30-98765432-1', telefono: '011-4000-2000', email: 'ventas@farmacasur.com', direccion: 'San Martín 3000', nombreContacto: 'Laura Fernández' },
  { id: 'p3', nombreEmpresa: 'Laboratorios Unidos', cuit: '30-11111111-2', telefono: '011-4000-3000', email: 'info@labsunidos.com', direccion: 'Rivadavia 7000', nombreContacto: 'Miguel Ángel' },
]

export const useProveedoresStore = create<ProveedoresState>((set, get) => ({
  proveedores: mockProveedores,

  addProveedor: (proveedor) => {
    const { proveedores } = get()
    const cuitExists = proveedores.some(p => p.cuit === proveedor.cuit)
    if (cuitExists) return { success: false, error: 'Ya existe un proveedor con este CUIT' }

    set((state) => ({
      proveedores: [...state.proveedores, { ...proveedor, id: Date.now().toString() }]
    }))
    return { success: true }
  },

  updateProveedor: (id, proveedor) => set((state) => ({
    proveedores: state.proveedores.map(p => p.id === id ? { ...p, ...proveedor } : p)
  })),

  deleteProveedor: (id) => set((state) => ({
    proveedores: state.proveedores.filter(p => p.id !== id)
  }))
}))
