import React, { useState } from 'react'
import { Proveedor } from '../types/pharmacy'

interface ProveedorFormProps {
  initialData?: Proveedor
  onSubmit: (data: Omit<Proveedor, 'id'>) => void
  onCancel: () => void
}

export const ProveedorForm: React.FC<ProveedorFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    nombreEmpresa: initialData?.nombreEmpresa || '',
    cuit: initialData?.cuit || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || '',
    nombreContacto: initialData?.nombreContacto || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-group">
        <label>Nombre de Empresa</label>
        <input 
          type="text" 
          value={formData.nombreEmpresa}
          onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
          required 
        />
      </div>
      
      <div className="form-group">
        <label>CUIT</label>
        <input 
          type="text" 
          value={formData.cuit}
          onChange={(e) => setFormData({...formData, cuit: e.target.value})}
          placeholder="XX-XXXXXXXX-X"
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
      
      <div className="form-group full-width">
        <label>Nombre de Contacto</label>
        <input 
          type="text" 
          value={formData.nombreContacto}
          onChange={(e) => setFormData({...formData, nombreContacto: e.target.value})}
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
