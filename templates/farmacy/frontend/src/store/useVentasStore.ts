import { create } from 'zustand'
import { Venta, VentaItem, Medicine, Cliente } from '../types/pharmacy'
import { api } from '../services/api'

// Mapper: Backend -> Frontend Medicine
const mapMedicineFromBackend = (backendMedicine: any): Medicine => ({
  id: backendMedicine.id,
  name: backendMedicine.tradeName || backendMedicine.name,
  principioActivo: backendMedicine.genericName || backendMedicine.principioActivo || '',
  laboratorioId: backendMedicine.laboratoryId || backendMedicine.laboratorioId || '',
  stock: backendMedicine.stock || 0,
  minStock: backendMedicine.minStock || 10,
  price: Number(backendMedicine.price) || 0,
  category: backendMedicine.category?.name || backendMedicine.category || 'Sin categoría',
})

// Mapper: Backend -> Frontend Cliente
const mapClienteFromBackend = (backendCliente: any): Cliente => ({
  id: backendCliente.id,
  nombre: backendCliente.name || backendCliente.nombre,
  dni: backendCliente.documentNumber || backendCliente.dni || '',
  telefono: backendCliente.phone || backendCliente.telefono || '',
  email: backendCliente.email || '',
  direccion: backendCliente.address || backendCliente.direccion || '',
})

interface VentasState {
  ventas: Venta[]
  cart: VentaItem[]
  clientes: Cliente[]
  medicines: Medicine[]
  isLoading: boolean
  error: string | null
  addToCart: (medicamentoId: string, cantidad: number) => { success: boolean; error?: string }
  removeFromCart: (medicamentoId: string) => void
  clearCart: () => void
  confirmVenta: (clienteId: string, metodoPago: Venta['metodoPago']) => Promise<boolean>
  getCartTotal: () => { subtotal: number; impuestos: number; total: number }
  getVentasByDateRange: (startDate: Date, endDate: Date) => Venta[]
  fetchMedicines: () => Promise<void>
  fetchClientes: () => Promise<void>
  fetchVentas: () => Promise<void>
}

export const useVentasStore = create<VentasState>((set, get) => ({
  ventas: [],
  cart: [],
  clientes: [],
  medicines: [],
  isLoading: false,
  error: null,

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

  fetchVentas: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get<any[]>('/sales')
      // TODO: Map backend sales to frontend Venta type
      set({ ventas: response || [], isLoading: false })
    } catch (error: any) {
      console.error('Error fetching sales:', error)
      set({ error: error.message || 'Error al cargar ventas', isLoading: false })
    }
  },

  addToCart: (medicamentoId, cantidad) => {
    const medicine = get().medicines.find(m => m.id === medicamentoId)
    if (!medicine) return { success: false, error: 'Medicamento no encontrado' }
    if (medicine.stock < cantidad) return { success: false, error: `Stock insuficiente. Stock actual: ${medicine.stock}` }

    set((state) => ({
      cart: [...state.cart, {
        medicamentoId,
        cantidad,
        precioUnitario: medicine.price,
        subtotal: medicine.price * cantidad
      }]
    }))
    return { success: true }
  },

  removeFromCart: (medicamentoId) => set((state) => ({
    cart: state.cart.filter(item => item.medicamentoId !== medicamentoId)
  })),

  clearCart: () => set({ cart: [] }),

  confirmVenta: async (clienteId, metodoPago) => {
    const { cart, medicines } = get()
    if (cart.length === 0) return false

    // Verificar stock nuevamente
    for (const item of cart) {
      const med = medicines.find(m => m.id === item.medicamentoId)
      if (!med || med.stock < item.cantidad) {
        return false
      }
    }

    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
    const impuestos = subtotal * 0.21
    const total = subtotal + impuestos

    try {
      const salePayload = {
        clientId: clienteId || undefined,
        items: cart.map(item => ({
          medicineId: item.medicamentoId,
          quantity: item.cantidad,
          unitPrice: item.precioUnitario,
        })),
        paymentMethod: metodoPago === 'tarjeta' ? 'card' :
          metodoPago === 'transferencia' ? 'transfer' : 'cash',
        total,
      }

      await api.post('/sales', salePayload)

      // Descontar stock localmente (el backend también lo hace)
      const updatedMedicines = medicines.map(m => {
        const cartItem = cart.find(item => item.medicamentoId === m.id)
        if (cartItem) {
          return { ...m, stock: m.stock - cartItem.cantidad }
        }
        return m
      })

      set({
        medicines: updatedMedicines,
        cart: []
      })

      // Refrescar ventas
      get().fetchVentas()

      return true
    } catch (error: any) {
      console.error('Error confirming sale:', error)
      set({ error: error.message || 'Error al confirmar venta' })
      return false
    }
  },

  getCartTotal: () => {
    const { cart } = get()
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
    const impuestos = subtotal * 0.21
    const total = subtotal + impuestos
    return { subtotal, impuestos, total }
  },

  getVentasByDateRange: (startDate, endDate) => {
    const { ventas } = get()
    return ventas.filter(v => {
      const fecha = new Date(v.fecha)
      return fecha >= startDate && fecha <= endDate
    })
  },
}))
