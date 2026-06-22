import React, { useState } from 'react'
import { Laboratorio } from '../types/pharmacy'

interface LaboratorioFormProps {
  initialData?: Laboratorio
  onSubmit: (data: Omit<Laboratorio, 'id'>) => void
  onCancel: () => void
}

export const LaboratorioForm: React.FC<LaboratorioFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    paisOrigen: initialData?.paisOrigen || '',
    sitioWeb: initialData?.sitioWeb || '',
    telefono: initialData?.telefono || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-group">
        <label>Nombre del Laboratorio</label>
        <input 
          type="text" 
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          required 
        />
      </div>
      
      <div className="form-group">
        <label>País de Origen</label>
        <input 
          type="text" 
          value={formData.paisOrigen}
          onChange={(e) => setFormData({...formData, paisOrigen: e.target.value})}
          required 
        />
      </div>
      
      <div className="form-group">
        <label>Sitio Web</label>
        <input 
          type="url" 
          value={formData.sitioWeb}
          onChange={(e) => setFormData({...formData, sitioWeb: e.target.value})}
          placeholder="https://..."
        />
      </div>
      
      <div className="form-group">
        <label>Teléfono</label>
        <input 
          type="tel" 
          value={formData.telefono}
          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
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
