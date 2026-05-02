import React, { useState } from 'react'
import { useInventarioStore } from '../store/useInventarioStore'
import { MedicineForm } from '../components/MedicineForm'
import { InventarioTable } from '../components/InventarioTable'
import { FormModal } from '../components/FormModal'
import { SearchInput } from '../components/SearchInput'
import { Medicine } from '../types/pharmacy'

export const InventarioPage: React.FC = () => {
  const { 
    laboratorios,
    searchQuery, 
    setSearchQuery, 
    addMedicine, 
    updateMedicine, 
    deleteMedicine,
    getFilteredMedicines,
    getLowStockMedicines 
  } = useInventarioStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>()
  const [showLowStock, setShowLowStock] = useState(false)
  
  const filteredMedicines = showLowStock 
    ? getLowStockMedicines() 
    : getFilteredMedicines()
  
  const handleAdd = () => {
    setEditingMedicine(undefined)
    setIsModalOpen(true)
  }
  
  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setIsModalOpen(true)
  }
  
  const handleDelete = (medicine: Medicine) => {
    if (window.confirm(`¿Está seguro de eliminar ${medicine.name}?`)) {
      deleteMedicine(medicine.id)
    }
  }
  
  const handleSubmit = (data: Omit<Medicine, 'id'>) => {
    if (editingMedicine) {
      updateMedicine(editingMedicine.id, data)
    } else {
      addMedicine(data)
    }
    setIsModalOpen(false)
  }
  
  const lowStockCount = getLowStockMedicines().length

  return (
    <div>
      <div className="content-header">
        <h1>Inventario de Medicamentos</h1>
        <p>Gestione el stock y catálogo de medicamentos</p>
      </div>
      
      <div className="section-controls">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre, principio activo o categoría..."
        />
        <div className="controls-right">
          {lowStockCount > 0 && (
            <button 
              className={`btn-secondary ${showLowStock ? 'active' : ''}`}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              ⚠️ Stock Bajo ({lowStockCount})
            </button>
          )}
          <button className="btn-primary" onClick={handleAdd}>
            + Nuevo Medicamento
          </button>
        </div>
      </div>
      
      <div className="content-section">
        <InventarioTable 
          medicines={filteredMedicines}
          laboratorios={laboratorios}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      <FormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(e) => { e.preventDefault() }}
        title={editingMedicine ? 'Editar Medicamento' : 'Nuevo Medicamento'}
      >
        <MedicineForm 
          initialData={editingMedicine}
          laboratorios={laboratorios}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </div>
  )
}
