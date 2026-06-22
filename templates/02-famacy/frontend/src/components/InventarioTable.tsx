import React from 'react'
import { Medicine, Laboratorio } from '../types/pharmacy'

interface InventarioTableProps {
  medicines: Medicine[]
  laboratorios: Laboratorio[]
  onEdit: (medicine: Medicine) => void
  onDelete: (medicine: Medicine) => void
}

export const InventarioTable: React.FC<InventarioTableProps> = ({ 
  medicines, 
  laboratorios,
  onEdit, 
  onDelete 
}) => {
  const getLabName = (id: string) => {
    const lab = laboratorios.find(l => l.id === id)
    return lab ? lab.nombre : 'Desconocido'
  }

  const getStockBadge = (medicine: Medicine) => {
    if (medicine.stock <= medicine.minStock) {
      return <span className="stock-badge low">Stock Bajo</span>
    } else if (medicine.stock <= medicine.minStock * 1.5) {
      return <span className="stock-badge medium">Stock Medio</span>
    } else {
      return <span className="stock-badge high">Stock Alto</span>
    }
  }

  if (medicines.length === 0) {
    return <div className="empty-state">No hay medicamentos en el inventario</div>
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Principio Activo</th>
            <th>Laboratorio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map(med => (
            <tr key={med.id}>
              <td>{med.name}</td>
              <td>{med.principioActivo}</td>
              <td>{getLabName(med.laboratorioId)}</td>
              <td>{med.category}</td>
              <td>{med.stock}</td>
              <td>${med.price.toFixed(2)}</td>
              <td>{getStockBadge(med)}</td>
              <td className="actions-cell">
                <button className="btn-icon" onClick={() => onEdit(med)}>✏️</button>
                <button className="btn-icon btn-danger" onClick={() => onDelete(med)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
