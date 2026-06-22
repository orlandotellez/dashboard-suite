import React, { useState } from 'react'
import { useProveedoresStore } from '../store/useProveedoresStore'
import { ProveedorForm } from '../components/ProveedorForm'
import { ProveedoresTable } from '../components/ProveedoresTable'
import { FormModal } from '../components/FormModal'
import { Proveedor } from '../types/pharmacy'

export const ProveedoresPage: React.FC = () => {
  const { 
    proveedores, 
    addProveedor, 
    updateProveedor, 
    deleteProveedor 
  } = useProveedoresStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | undefined>()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const handleAdd = () => {
    setEditingProveedor(undefined)
    setIsModalOpen(true)
  }
  
  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setIsModalOpen(true)
  }
  
  const handleDelete = (proveedor: Proveedor) => {
    if (window.confirm(`¿Está seguro de eliminar a ${proveedor.nombreEmpresa}?`)) {
      deleteProveedor(proveedor.id)
      setMessage({ type: 'success', text: 'Proveedor eliminado exitosamente' })
      setTimeout(() => setMessage(null), 3000)
    }
  }
  
  const handleSubmit = (data: Omit<Proveedor, 'id'>) => {
    if (editingProveedor) {
      updateProveedor(editingProveedor.id, data)
      setMessage({ type: 'success', text: 'Proveedor actualizado exitosamente' })
    } else {
      const result = addProveedor(data)
      if (result.success) {
        setMessage({ type: 'success', text: 'Proveedor registrado exitosamente' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al registrar proveedor' })
        return
      }
    }
    setIsModalOpen(false)
    setTimeout(() => setMessage(null), 3000)
  }
  
  return (
    <div>
      <div className="content-header">
        <h1>Gestión de Proveedores</h1>
        <p>Administre la información de contacto de sus proveedores</p>
      </div>
      
      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="section-controls">
        <div className="controls-right">
          <button className="btn-primary" onClick={handleAdd}>
            + Nuevo Proveedor
          </button>
        </div>
      </div>
      
      <div className="content-section">
        <ProveedoresTable 
          proveedores={proveedores}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      <FormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(e) => { e.preventDefault() }}
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <ProveedorForm 
          initialData={editingProveedor}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </div>
  )
}
