import React from 'react'
import { usePharmacyStore, Medicine } from '../store/usePharmacyStore'
import { Search } from 'lucide-react'

export const MedicineTable: React.FC = () => {
  const { getFilteredMedicines, searchQuery, setSearchQuery } = usePharmacyStore()

  const getStockLevel = (med: Medicine) => {
    if (med.stock <= med.minStock) return 'low'
    if (med.stock <= med.minStock * 2) return 'medium'
    return 'high'
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Lista de Medicamentos</h2>
        <div className="search-bar">
          <Search size={18} color="var(--color-text-secondary)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredMedicines().map((med) => (
            <tr key={med.id}>
              <td style={{ fontWeight: 500 }}>{med.name}</td>
              <td>{med.category}</td>
              <td>${med.price.toFixed(2)}</td>
              <td>{med.stock} unidades</td>
              <td>
                <span className={`stock-badge ${getStockLevel(med)}`}>
                  {getStockLevel(med) === 'low' ? 'Bajo' : getStockLevel(med) === 'medium' ? 'Medio' : 'Alto'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
