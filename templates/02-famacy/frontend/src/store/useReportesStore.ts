import { create } from 'zustand'
import { Venta, Medicine } from '../types/pharmacy'

interface ReportesState {
  ventas: Venta[]
  medicines: Medicine[]
  getVentasByDateRange: (startDate: Date, endDate: Date) => Venta[]
  getVentasByMedicamento: () => { medicamento: string; total: number; cantidad: number }[]
  getVentasDiarias: (dias: number) => { fecha: string; total: number }[]
}

// Mock Data - Ventas de ejemplo para los últimos días
const mockVentas: Venta[] = [
  {
    id: 'v1',
    clienteId: 'c1',
    items: [
      { medicamentoId: '1', cantidad: 2, precioUnitario: 5.50, subtotal: 11.00 },
      { medicamentoId: '2', cantidad: 1, precioUnitario: 7.20, subtotal: 7.20 }
    ],
    subtotal: 18.20,
    impuestos: 3.82,
    total: 22.02,
    metodoPago: 'efectivo',
    fecha: new Date('2026-05-01')
  },
  {
    id: 'v2',
    clienteId: 'c2',
    items: [
      { medicamentoId: '3', cantidad: 1, precioUnitario: 12.30, subtotal: 12.30 }
    ],
    subtotal: 12.30,
    impuestos: 2.58,
    total: 14.88,
    metodoPago: 'tarjeta',
    fecha: new Date('2026-04-30')
  },
  {
    id: 'v3',
    clienteId: 'c1',
    items: [
      { medicamentoId: '1', cantidad: 3, precioUnitario: 5.50, subtotal: 16.50 },
      { medicamentoId: '4', cantidad: 2, precioUnitario: 8.90, subtotal: 17.80 }
    ],
    subtotal: 34.30,
    impuestos: 7.20,
    total: 41.50,
    metodoPago: 'transferencia',
    fecha: new Date('2026-04-29')
  },
]

const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', principioActivo: 'Paracetamol', laboratorioId: 'lab1', stock: 120, minStock: 50, price: 5.50, category: 'Analgésicos' },
  { id: '2', name: 'Ibuprofeno 400mg', principioActivo: 'Ibuprofeno', laboratorioId: 'lab2', stock: 85, minStock: 40, price: 7.20, category: 'Antiinflamatorios' },
  { id: '3', name: 'Amoxicilina 500mg', principioActivo: 'Amoxicilina', laboratorioId: 'lab3', stock: 15, minStock: 30, price: 12.30, category: 'Antibióticos' },
  { id: '4', name: 'Loratadina 10mg', principioActivo: 'Loratadina', laboratorioId: 'lab1', stock: 200, minStock: 50, price: 8.90, category: 'Antialérgicos' },
]

export const useReportesStore = create<ReportesState>((_, get) => ({
  ventas: mockVentas,
  medicines: mockMedicines,
  
  getVentasByDateRange: (startDate, endDate) => {
    const { ventas } = get()
    return ventas.filter(v => {
      const fecha = new Date(v.fecha)
      return fecha >= startDate && fecha <= endDate
    })
  },
  
  getVentasByMedicamento: () => {
    const { ventas, medicines } = get()
    const medicamentoStats: { [key: string]: { total: number; cantidad: number } } = {}
    
    ventas.forEach(venta => {
      venta.items.forEach(item => {
        if (!medicamentoStats[item.medicamentoId]) {
          medicamentoStats[item.medicamentoId] = { total: 0, cantidad: 0 }
        }
        medicamentoStats[item.medicamentoId].total += item.subtotal
        medicamentoStats[item.medicamentoId].cantidad += item.cantidad
      })
    })
    
    return Object.entries(medicamentoStats).map(([medicamentoId, stats]) => {
      const med = medicines.find(m => m.id === medicamentoId)
      return {
        medicamento: med?.name || 'Desconocido',
        total: stats.total,
        cantidad: stats.cantidad
      }
    }).sort((a, b) => b.total - a.total)
  },
  
  getVentasDiarias: (dias) => {
    const { ventas } = get()
    const hoy = new Date()
    const resultado: { [key: string]: number } = {}
    
    // Inicializar últimos 'dias' días
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      resultado[fechaStr] = 0
    }
    
    // Sumar ventas
    ventas.forEach(v => {
      const fechaStr = new Date(v.fecha).toISOString().split('T')[0]
      if (resultado[fechaStr] !== undefined) {
        resultado[fechaStr] += v.total
      }
    })
    
    return Object.entries(resultado).map(([fecha, total]) => ({ fecha, total }))
  }
}))
