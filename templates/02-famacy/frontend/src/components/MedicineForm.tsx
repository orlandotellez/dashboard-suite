import React, { useState } from 'react'
import { Medicine, Laboratorio } from '../types/pharmacy'

interface MedicineFormProps {
  initialData?: Medicine
  laboratorios: Laboratorio[]
  onSubmit: (data: Omit<Medicine, 'id'>) => void
  onCancel: () => void
}

export const MedicineForm: React.FC<MedicineFormProps> = ({ 
  initialData, 
  laboratorios,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    principioActivo: initialData?.principioActivo || '',
    laboratorioId: initialData?.laboratorioId || '',
    stock: initialData?.stock || 0,
    minStock: initialData?.minStock || 0,
    price: initialData?.price || 0,
    category: initialData?.category || ''
  })

  const categories = ['Analgésicos', 'Antiinflamatorios', 'Antibióticos', 'Antialérgicos', 'Antiácidos', 'Respiratorios', 'Antidiabéticos', 'Cardiovascular']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-group">
        <label>Nombre del Medicamento</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
        />
      </div>
      
      <div className="form-group">
        <label>Principio Activo</label>
        <input 
          type="text" 
          value={formData.principioActivo}
          onChange={(e) => setFormData({...formData, principioActivo: e.target.value})}
          required 
        />
      </div>
      
      <div className="form-group">
        <label>Laboratorio</label>
        <select 
          value={formData.laboratorioId}
          onChange={(e) => setFormData({...formData, laboratorioId: e.target.value})}
          required
        >
          <option value="">Seleccionar...</option>
          {laboratorios.map(lab => (
            <option key={lab.id} value={lab.id}>{lab.nombre}</option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Categoría</label>
        <select 
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        >
          <option value="">Seleccionar...</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Stock Actual</label>
        <input 
          type="number" 
          value={formData.stock}
          onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
          min="0"
          required 
        />
      </div>
      
      <div className="form-group">
        <label>Stock Mínimo</label>
        <input 
          type="number" 
          value={formData.minStock}
          onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
          min="0"
          required 
        />
      </div>
      
      <div className="form-group">
        <label>Precio ($)</label>
        <input 
          type="number" 
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
          min="0"
          step="0.01"
          required 
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
