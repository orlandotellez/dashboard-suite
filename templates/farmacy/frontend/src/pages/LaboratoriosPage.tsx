import React, { useState } from 'react'
import { useLaboratoriosStore } from '../store/useLaboratoriosStore'
import { LaboratorioForm } from '../components/LaboratorioForm'
import { LaboratoriosTable } from '../components/LaboratoriosTable'
import { FormModal } from '../components/FormModal'
import { Laboratorio } from '../types/pharmacy'

export const LaboratoriosPage: React.FC = () => {
  const { 
    laboratorios, 
    addLaboratorio, 
    updateLaboratorio, 
    deleteLaboratorio 
  } = useLaboratoriosStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLaboratorio, setEditingLaboratorio] = useState<Laboratorio | undefined>()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Laboratorio | null>(null)
  
  const handleAdd = () => {
    setEditingLaboratorio(undefined)
    setIsModalOpen(true)
  }
  
  const handleEdit = (laboratorio: Laboratorio) => {
    setEditingLaboratorio(laboratorio)
    setIsModalOpen(true)
  }
  
  const handleDelete = (laboratorio: Laboratorio) => {
    const result = deleteLaboratorio(laboratorio.id)
    if (!result.success && result.hasMedicamentos) {
      setDeleteConfirm(laboratorio)
      return
    }
    setMessage({ type: 'success', text: 'Laboratorio eliminado exitosamente' })
    setTimeout(() => setMessage(null), 3000)
  }
  
  const handleForceDelete = () => {
    if (deleteConfirm) {
      deleteLaboratorio(deleteConfirm.id, true)
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Laboratorio eliminado exitosamente' })
      setTimeout(() => setMessage(null), 3000)
    }
  }
  
  const handleSubmit = (data: Omit<Laboratorio, 'id'>) => {
    if (editingLaboratorio) {
      updateLaboratorio(editingLaboratorio.id, data)
      setMessage({ type: 'success', text: 'Laboratorio actualizado exitosamente' })
    } else {
      const result = addLaboratorio(data)
      if (result.success) {
        setMessage({ type: 'success', text: 'Laboratorio registrado exitosamente' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al registrar laboratorio' })
        return
      }
    }
    setIsModalOpen(false)
    setTimeout(() => setMessage(null), 3000)
  }
  
  return (
    <div>
      <div className="content-header">
        <h1>Gestión de Laboratorios</h1>
        <p>Administre el catálogo de laboratorios y marcas</p>
      </div>
      
      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="section-controls">
        <div className="controls-right">
          <button className="btn-primary" onClick={handleAdd}>
            + Nuevo Laboratorio
          </button>
        </div>
      </div>
      
      <div className="content-section">
        <LaboratoriosTable 
          laboratorios={laboratorios}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      <FormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(e) => { e.preventDefault() }}
        title={editingLaboratorio ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}
      >
        <LaboratorioForm 
          initialData={editingLaboratorio}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
      
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>El laboratorio <strong>{deleteConfirm.nombre}</strong> tiene medicamentos asociados.</p>
              <p>¿Desea eliminarlo de todos modos?</p>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </button>
                <button className="btn-danger" onClick={handleForceDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
