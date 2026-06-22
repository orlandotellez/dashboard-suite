import { create } from 'zustand'
import { Laboratorio, Medicine } from '../types/pharmacy'

interface LaboratoriosState {
  laboratorios: Laboratorio[]
  medicines: Medicine[]
  addLaboratorio: (laboratorio: Omit<Laboratorio, 'id'>) => { success: boolean; error?: string }
  updateLaboratorio: (id: string, laboratorio: Partial<Laboratorio>) => void
  deleteLaboratorio: (id: string, force?: boolean) => { success: boolean; error?: string; hasMedicamentos?: boolean }
}

// Mock Data - Backend doesn't have laboratories endpoint yet
const mockLaboratorios: Laboratorio[] = [
  { id: 'lab1', nombre: 'Bayer', paisOrigen: 'Alemania', sitioWeb: 'www.bayer.com', telefono: '0800-333-3333' },
  { id: 'lab2', nombre: 'Pfizer', paisOrigen: 'EEUU', sitioWeb: 'www.pfizer.com', telefono: '0800-444-4444' },
  { id: 'lab3', nombre: 'Roche', paisOrigen: 'Suiza', sitioWeb: 'www.roche.com', telefono: '0800-555-5555' },
  { id: 'lab4', nombre: 'Laboratorios Bagó', paisOrigen: 'Argentina', sitioWeb: 'www.bago.com', telefono: '0800-666-6666' },
  { id: 'lab5', nombre: 'GlaxoSmithKline', paisOrigen: 'Reino Unido', sitioWeb: 'www.gsk.com', telefono: '0800-777-7777' },
]

const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', principioActivo: 'Paracetamol', laboratorioId: 'lab1', stock: 120, minStock: 50, price: 5.50, category: 'Analgésicos' },
  { id: '2', name: 'Ibuprofeno 400mg', principioActivo: 'Ibuprofeno', laboratorioId: 'lab2', stock: 85, minStock: 40, price: 7.20, category: 'Antiinflamatorios' },
  { id: '3', name: 'Amoxicilina 500mg', principioActivo: 'Amoxicilina', laboratorioId: 'lab3', stock: 15, minStock: 30, price: 12.30, category: 'Antibióticos' },
]

export const useLaboratoriosStore = create<LaboratoriosState>((set, get) => ({
  laboratorios: mockLaboratorios,
  medicines: mockMedicines,

  addLaboratorio: (laboratorio) => {
    const { laboratorios } = get()
    const nameExists = laboratorios.some(l => l.nombre.toLowerCase() === laboratorio.nombre.toLowerCase())
    if (nameExists) return { success: false, error: 'Ya existe un laboratorio con este nombre' }

    set((state) => ({
      laboratorios: [...state.laboratorios, { ...laboratorio, id: Date.now().toString() }]
    }))
    return { success: true }
  },

  updateLaboratorio: (id, laboratorio) => set((state) => ({
    laboratorios: state.laboratorios.map(l => l.id === id ? { ...l, ...laboratorio } : l)
  })),

  deleteLaboratorio: (id, force = false) => {
    const { medicines } = get()
    const hasMedicamentos = medicines.some(m => m.laboratorioId === id)

    if (hasMedicamentos && !force) {
      return { success: false, error: 'Este laboratorio tiene medicamentos asociados', hasMedicamentos: true }
    }

    set((state) => ({
      laboratorios: state.laboratorios.filter(l => l.id !== id)
    }))
    return { success: true }
  }
}))
