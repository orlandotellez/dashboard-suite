import React from 'react'
import { Cliente } from '../types/pharmacy'

interface ClientesTableProps {
  clientes: Cliente[]
  onEdit: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
}

export const ClientesTable: React.FC<ClientesTableProps> = ({ 
  clientes, 
  onEdit, 
  onDelete 
}) => {
  if (clientes.length === 0) {
    return <div className="empty-state">No hay clientes registrados</div>
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.dni}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.email}</td>
              <td>{cliente.direccion}</td>
              <td className="actions-cell">
                <button className="btn-icon" onClick={() => onEdit(cliente)}>✏️</button>
                <button className="btn-icon btn-danger" onClick={() => onDelete(cliente)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
