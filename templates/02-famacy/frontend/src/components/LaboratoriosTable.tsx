import React from 'react'
import { Laboratorio } from '../types/pharmacy'

interface LaboratoriosTableProps {
  laboratorios: Laboratorio[]
  onEdit: (laboratorio: Laboratorio) => void
  onDelete: (laboratorio: Laboratorio) => void
}

export const LaboratoriosTable: React.FC<LaboratoriosTableProps> = ({ 
  laboratorios, 
  onEdit, 
  onDelete 
}) => {
  if (laboratorios.length === 0) {
    return <div className="empty-state">No hay laboratorios registrados</div>
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>País de Origen</th>
            <th>Sitio Web</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {laboratorios.map(lab => (
            <tr key={lab.id}>
              <td><strong>{lab.nombre}</strong></td>
              <td>{lab.paisOrigen}</td>
              <td>
                {lab.sitioWeb && (
                  <a href={lab.sitioWeb} target="_blank" rel="noopener noreferrer">
                    {lab.sitioWeb.replace('https://', '')}
                  </a>
                )}
              </td>
              <td>{lab.telefono}</td>
              <td className="actions-cell">
                <button className="btn-icon" onClick={() => onEdit(lab)}>✏️</button>
                <button className="btn-icon btn-danger" onClick={() => onDelete(lab)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
