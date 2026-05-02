import React, { useState } from 'react'
import { Cliente } from '../types/pharmacy'

interface ClienteFormProps {
  initialData?: Cliente
  onSubmit: (data: Omit<Cliente, 'id'>) => void
  onCancel: () => void
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    dni: initialData?.dni || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-group">
        <label>Nombre Completo</label>
        <input 
          type="text" 
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          required 
        />
      </div>
      
      <div className="form-group">
        <label>DNI</label>
        <input 
          type="text" 
          value={formData.dni}
          onChange={(e) => setFormData({...formData, dni: e.target.value})}
          required 
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
      
      <div className="form-group">
        <label>Email</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      
      <div className="form-group full-width">
        <label>Dirección</label>
        <input 
          type="text" 
          value={formData.direccion}
          onChange={(e) => setFormData({...formData, direccion: e.target.value})}
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
