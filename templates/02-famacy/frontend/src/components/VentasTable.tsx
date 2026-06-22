import React from 'react'
import { Venta, Cliente, Medicine } from '../types/pharmacy'

interface VentasTableProps {
  ventas: Venta[]
  clientes: Cliente[]
  medicines: Medicine[]
}

export const VentasTable: React.FC<VentasTableProps> = ({ ventas, clientes, medicines }) => {
  const getClienteName = (id: string) => {
    const cliente = clientes.find(c => c.id === id)
    return cliente ? cliente.nombre : 'Desconocido'
  }
  
  const getMedicinesSummary = (items: Venta['items']) => {
    return items.map(item => {
      const med = medicines.find(m => m.id === item.medicamentoId)
      return med ? `${med.name} (x${item.cantidad})` : 'N/A'
    }).join(', ')
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getMetodoPagoLabel = (metodo: string) => {
    const labels: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia'
    }
    return labels[metodo] || metodo
  }

  if (ventas.length === 0) {
    return <div className="empty-state">No hay ventas registradas</div>
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Medicamentos</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Método</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(venta => (
            <tr key={venta.id}>
              <td>{formatDate(venta.fecha)}</td>
              <td>{getClienteName(venta.clienteId)}</td>
              <td className="medicines-cell">{getMedicinesSummary(venta.items)}</td>
              <td>${venta.subtotal.toFixed(2)}</td>
              <td>${venta.impuestos.toFixed(2)}</td>
              <td><strong>${venta.total.toFixed(2)}</strong></td>
              <td><span className="badge">{getMetodoPagoLabel(venta.metodoPago)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
