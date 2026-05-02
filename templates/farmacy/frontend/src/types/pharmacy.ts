// Tipos para el sistema de gestión de farmacia

export interface Medicine {
  id: string
  name: string
  principioActivo: string
  laboratorioId: string
  stock: number
  minStock: number
  price: number
  category: string
}

export interface VentaItem {
  medicamentoId: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Venta {
  id: string
  clienteId: string
  items: VentaItem[]
  subtotal: number
  impuestos: number  // IVA 21%
  total: number
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
  fecha: Date
}

export interface Cliente {
  id: string
  nombre: string
  dni: string
  telefono: string
  email: string
  direccion: string
}

export interface Proveedor {
  id: string
  nombreEmpresa: string
  cuit: string
  telefono: string
  email: string
  direccion: string
  nombreContacto: string
}

export interface Laboratorio {
  id: string
  nombre: string
  paisOrigen: string
  sitioWeb: string
  telefono: string
}
