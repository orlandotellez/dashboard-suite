import React from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  emptyMessage?: string
}

export const DataTable = <T extends { id: string }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete,
  emptyMessage = 'No hay datos para mostrar'
}: DataTableProps<T>) => {
  if (data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.header}</th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="actions-cell">
                  {onEdit && (
                    <button 
                      className="btn-icon" 
                      onClick={() => onEdit(item)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => onDelete(item)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
