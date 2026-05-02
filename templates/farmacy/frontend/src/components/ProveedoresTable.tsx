import React from 'react'
import { Proveedor } from '../types/pharmacy'

interface ProveedoresTableProps {
  proveedores: Proveedor[]
  onEdit: (proveedor: Proveedor) => void
  onDelete: (proveedor: Proveedor) => void
}

export const ProveedoresTable: React.FC<ProveedoresTableProps> = ({ 
  proveedores, 
  onEdit, 
  onDelete 
}) => {
  if (proveedores.length === 0) {
    return <div className="empty-state">No hay proveedores registrados</div>
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>CUIT</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(prov => (
            <tr key={prov.id}>
              <td>
                <strong>{prov.nombreEmpresa}</strong><br/>
                <small>{prov.nombreContacto}</small>
              </td>
              <td>{prov.cuit}</td>
              <td>{prov.nombreContacto}</td>
              <td>{prov.telefono}</td>
              <td>{prov.email}</td>
              <td className="actions-cell">
                <button className="btn-icon" onClick={() => onEdit(prov)}>✏️</button>
                <button className="btn-icon btn-danger" onClick={() => onDelete(prov)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
